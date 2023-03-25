import { v4 as uuidv4 } from 'uuid';
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
import * as sinon from 'sinon';
import { PaymentIntent } from '@circle-fin/circle-sdk';
import TransactionRepo from '../../src/repositories/TransactionRepo';
import PaymentRepo from '../../src/repositories/PaymentRepo';
import PropertyEntity from '../../src/model/PropertyEntity';
import { Status } from '../../src/model/PaymentEntity';
import { BodyMessage } from '../../src/controllers/v1/CirclePaymentsWebhookController';
import sleep from '../../src/utils/sleep';
import PropertyRepo from '../../src/repositories/PropertyRepo';
const SUCCESS = 200;

const paymentIntentId = uuidv4();
let property: PropertyEntity;
if (process.env.TEST_CI) {
  describe('Circle Webhook', () => {
    beforeEach(() => {
      sinon.restore();
    });
    it('payment intent save new transaction', async () => {
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
      const transaction = await new TransactionRepo().find({
        payment: {
          paymentIntentId: paymentIntentId,
        },
      });
      const payment = await new PaymentRepo().find({
        paymentIntentId: paymentIntentId,
      });
      expect(payment[0].paymentIntentId).to.eq(paymentIntentId);
      const reserve =
        payment[0].property.erc20?.currentSupply &&
        payment[0].property.erc20?.currentSupply - 1;
      expect(
        payment[0].property.erc20?.supply ===
          payment[0].property.erc20?.currentSupply
      ).to.eq(true);
      expect(reserve === payment[0].property.erc20?.reserveSupply).to.eq(true);
      expect(transaction[0].tokens).to.eq(1);
      expect(transaction[0].amount).to.eq(100);
      expect(transaction[0].amountType).to.eq('USD');
      expect(transaction[0].hash).to.eq(null);
      expect(transaction[0].paymentStatus).to.eq('PENDING');
      expect(transaction[0].type).to.eq('BUY');
    });
    it('payment paid triggers sell tokens', async () => {
      const paidPaymentParsed = JSON.parse(paidPayment['Message']);
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
      const payment = await new PaymentRepo().find({
        paymentIntentId: paymentIntentId,
      });
      expect(payment[0].paymentIntentId).to.eq(
        paidPaymentParsed.payment.paymentIntentId
      );
      expect(payment[0].hash).to.eq(paidPaymentParsed.payment.transactionHash);
      expect(payment[0].depositAddress).to.eq(
        paidPaymentParsed.payment.depositAddress.address
      );
      expect(payment[0].status).to.eq(Status.Paid);
      expect(payment[0].merchantWalletId).to.eq(
        paidPaymentParsed.payment.merchantWalletId
      );
      expect(payment[0].merchantId).to.eq(paidPaymentParsed.payment.merchantId);
      expect(payment[0].amount.amount).to.eq(
        paidPaymentParsed.payment.amount.amount
      );
      expect(transaction[0].hash).to.eq(
        paidPaymentParsed.payment.transactionHash
      );
      expect(transaction[0].paymentStatus).to.eq(Status.Tokenized);
    });
    it('Paid currency and settlement currency are not the same', () => {
      console.log();
    });
  });
  describe('Payment Transacction', () => {
    it('can be get by paymentIntentId', async () => {
      const validatedEmail = config.validatedEmails.split(',')[0];
      const accessToken = await login(server, validatedEmail);
      const response = await request(await server)
        .get(`/api/v1/transaction/${paymentIntentId}`)
        .set({ Authorization: `Bearer ${accessToken}` });
      expect(response.statusCode).to.eq(SUCCESS);
      expect(response.body.property.id).to.eq(property.id);
      expect(response.body.tokens).to.eq(1);
      expect(response.body.amount).to.eq(100);
      expect(response.body.property.tokenPrice / 1000).to.eq(100);

      expect(response.body.hash).to.eq(
        '0x0a685cdd12f3b5ac4f370b1cc1b948abe4ac54a8d86c45ee3c7d28a80d8eea9b'
      );
      expect(response.body.paymentStatus).to.eq(Status.Tokenized);
      expect(response.body.type).to.eq('BUY');
    });
    it('can be get all transactions by user', async () => {
      const validatedEmail = config.validatedEmails.split(',')[0];
      const accessToken = await login(server, validatedEmail);
      const response = await request(await server)
        .get('/api/v1/transaction')
        .set({ Authorization: `Bearer ${accessToken}` });
      expect(response.statusCode).to.eq(SUCCESS);
      expect(response.body.length > 0).to.eq(true);
    });
  });
}
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
    paidPayment['Message'] = JSON.stringify(paidPaymentParsed);
  }
};
