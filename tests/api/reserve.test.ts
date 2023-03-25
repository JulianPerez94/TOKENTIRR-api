import { v4 as uuidv4 } from 'uuid';
import * as sinon from 'sinon';
import * as request from 'supertest';
import { expect } from 'chai';
import server from '../test_support/server';
import config from '../../src/config/default';
import {
  addProperty,
  createPaymentIntentWalletData,
  login,
  paymentIntent,
  paymentRes,
  paidPayment,
} from '../test_support';
import PaymentIntentService from '../../src/services/PaymentIntentService';
import { PaymentIntent } from '@circle-fin/circle-sdk';
import TransactionRepo from '../../src/repositories/TransactionRepo';
import PropertyEntity from '../../src/model/PropertyEntity';
import PaymentEntity, { Status } from '../../src/model/PaymentEntity';
import { BodyMessage } from '../../src/controllers/v1/CirclePaymentsWebhookController';
import ERC20Repo from '../../src/repositories/ERC20Repo';
import PropertyRepo from '../../src/repositories/PropertyRepo';
import sleep from '../../src/utils/sleep';
import BalanceService from '../../src/services/BalanceService';
import BalanceRepo from '../../src/repositories/BalanceRepo';
import PaymentRepo from '../../src/repositories/PaymentRepo';
import Container from 'typedi';
import RollbackExpiredPaymentsAction from '../../src/actions/RollbackExpiredPaymentsAction';
const SUCCESS = 200;

const paymentIntentId = uuidv4();
let property: PropertyEntity;
if (process.env.TEST_CI) {
  beforeEach(() => {
    sinon.restore();
  });
  describe('Circle Webhook with ERC20', () => {
    beforeEach(() => {
      sinon.restore();
    });
    it('handle erc20 reserve supply', async () => {
      property = await createPaymentIntent(paymentIntentId);
      const response = await request(await server)
        .post('/api/v1/circle-payments-webhook')
        .set({
          'Content-Type': 'text/plain',
          Accept: '*/*',
          'Cache-Control': 'no-cache',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Length': Buffer.byteLength(JSON.stringify(paymentIntent)),
          Connection: 'keep-alive',
        })
        .send(JSON.stringify(paymentIntent));
      expect(response.statusCode).to.eq(SUCCESS);
      const propertyWithErc20 = await new PropertyRepo().find({
        id: property.id,
      });
      const reserve =
        propertyWithErc20[0].erc20?.currentSupply &&
        propertyWithErc20[0].erc20?.currentSupply - 1;
      expect(
        propertyWithErc20[0].erc20?.supply ===
          propertyWithErc20[0].erc20?.currentSupply
      ).to.eq(true);
      expect(reserve === propertyWithErc20[0].erc20?.reserveSupply).to.eq(true);
      if (property.erc20) {
        const erc20 = await new ERC20Repo().find({
          id: property.erc20.id,
        });
        expect(
          erc20.length &&
            erc20[0].reserveSupply === propertyWithErc20[0].erc20?.reserveSupply
        ).to.eq(true);
      } else {
        throw new Error(
          'No erc 20 asociated to property testing circle webhook payment'
        );
      }
    });
    it('payment paid update erc20 reserve and currentSupply', async () => {
      const paidPaymentParsed = JSON.parse(paidPayment['Message']);
      await stubPendingPaidPayment(paidPaymentParsed, paymentIntentId);
      await request(await server)
        .post('/api/v1/circle-payments-webhook')
        .set({
          'Content-Type': 'text/plain',
          Accept: '*/*',
          'Cache-Control': 'no-cache',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Length': Buffer.byteLength(JSON.stringify(paidPayment)),
          Connection: 'keep-alive',
        })
        .send(JSON.stringify(paidPayment));
      const transactionInProcess = (
        await new TransactionRepo().find({ payment: { paymentIntentId } })
      )[0];
      expect(transactionInProcess.paymentStatus).to.eq(Status.Process);
      await stubCreatePaymentPaid(paidPaymentParsed, paymentIntentId);
      const response = await request(await server)
        .post('/api/v1/circle-payments-webhook')
        .set({
          'Content-Type': 'text/plain',
          Accept: '*/*',
          'Cache-Control': 'no-cache',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Length': Buffer.byteLength(JSON.stringify(paidPayment)),
          Connection: 'keep-alive',
        })
        .send(JSON.stringify(paidPayment));
      expect(response.statusCode).to.eq(SUCCESS);
      const transaction = await new TransactionRepo().find({
        payment: {
          paymentIntentId: paymentIntentId,
        },
      });
      expect(transaction[0].hash).to.eq(
        paidPaymentParsed.payment.transactionHash
      );
      expect(transaction[0].paymentStatus).to.eq(Status.Tokenized);
      const propertyWithErc20 = await new PropertyRepo().find({
        id: property.id,
      });
      const reserve =
        propertyWithErc20[0].erc20?.supply &&
        propertyWithErc20[0].erc20?.supply - 1;

      expect(reserve === propertyWithErc20[0].erc20?.currentSupply).to.eq(true);
      expect(reserve === propertyWithErc20[0].erc20?.reserveSupply).to.eq(true);
      if (property.erc20) {
        const erc20 = await new ERC20Repo().find({
          id: property.erc20.id,
        });
        expect(
          erc20.length &&
            erc20[0].reserveSupply === propertyWithErc20[0].erc20?.reserveSupply
        ).to.eq(true);
      } else {
        throw new Error(
          'No erc 20 asociated to property testing circle webhook payment'
        );
      }
      expect(property.availableTokens).to.eq(100);
      await sleep(25000);
      const updatedProperty = (
        await new PropertyRepo().find({ id: property.id })
      )[0];
      expect(updatedProperty.availableTokens).to.eq(99);
      expect(updatedProperty.erc20?.reserveSupply).to.eq(99999);

      const ew = await BalanceService.connectToEthersWrapper(
        propertyWithErc20[0].erc20?.contractAddress || ''
      );
      const balance = await new BalanceRepo().find({
        erc20: {
          id: propertyWithErc20[0].erc20?.id,
        },
      });
      const balanceInSC = await ew.balanceOfWallet(balance[0].account);
      expect(balance[0].confirmed).to.eq(true);
      expect(balanceInSC.toString()).to.eq('1000000000000000000');
      await testRollbackIsWorkingWhenPaymentExpires();
    });
  });
}

const testRollbackIsWorkingWhenPaymentExpires = async () => {
  const rollbackPayment = (
    await new PaymentRepo().find({
      paymentIntentId,
    })
  )[0] as PaymentEntity;
  await Container.get(RollbackExpiredPaymentsAction).update(
    rollbackPayment as PaymentEntity
  );
  const rollbackPropertyWithErc20 = (
    await new PropertyRepo().find({
      id: property.id,
    })
  )[0];

  expect(rollbackPropertyWithErc20.erc20?.reserveSupply).to.eq(100000);
  const transaction = (
    await new TransactionRepo().find({
      payment: {
        id: rollbackPayment.id,
      },
    })
  )[0];
  const payment = (
    await new PaymentRepo().find({
      paymentIntentId,
    })
  )[0] as PaymentEntity;
  expect(transaction.paymentStatus).to.eq(Status.Expired);
  expect(payment.status).to.eq(Status.Expired);
};
const createPaymentIntent = async (paymentIntentId = uuidv4()) => {
  const paymentIntentParsed = JSON.parse(paymentIntent['Message']);
  paymentRes.id = paymentIntentId;
  paymentIntentParsed.paymentIntent.id = paymentIntentId;
  paymentIntent['Message'] = JSON.stringify(paymentIntentParsed);
  sinon
    .stub(PaymentIntentService.prototype, 'circleCreatePaymentIntent')
    .resolves(paymentRes as unknown as PaymentIntent);
  const validatedEmail = config.validatedEmails.split(',')[0];
  const accessToken = await login(server, validatedEmail);
  const { body: property } = await addProperty(server, validatedEmail);
  const propertyId = property.id;
  const r = await request(await server)
    .post('/api/v1/erc20')
    .send({
      propertyId: propertyId,
      bankAccount: 'bank-account',
    })
    .set({ Authorization: `Bearer ${accessToken}` });
  await sleep(25000);
  createPaymentIntentWalletData.propertyId = propertyId;
  await request(await server)
    .post('/api/v1/payment-intent')
    .send(createPaymentIntentWalletData)
    .set({ Authorization: `Bearer ${accessToken}` });
  const propertyWithErc20 = await new PropertyRepo().find({ id: propertyId });
  return propertyWithErc20[0];
};

const stubCreatePaymentPaid = async (
  paidPaymentParsed: BodyMessage,
  paymentIntentId: string
) => {
  if (paidPaymentParsed.payment) {
    paidPaymentParsed.payment.paymentIntentId = paymentIntentId;
    paidPaymentParsed.payment.status = 'paid';
    paidPayment['Message'] = JSON.stringify(paidPaymentParsed);
  }
};
const stubPendingPaidPayment = async (
  paidPaymentParsed: BodyMessage,
  paymentIntentId: string
) => {
  if (paidPaymentParsed.payment) {
    paidPaymentParsed.payment.paymentIntentId = paymentIntentId;
    paidPaymentParsed.payment.status = 'pending';
    paidPayment['Message'] = JSON.stringify(paidPaymentParsed);
  }
};
