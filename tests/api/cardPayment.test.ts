import * as request from 'supertest';
import { expect } from 'chai';
import { v4 as uuidv4 } from 'uuid';
import server from '../test_support/server';
import config from '../../src/config/default';
import {
  addProperty,
  createPaymentIntentWalletData,
  login,
} from '../test_support';
import {
  cardPayment,
  cardPaymentRes,
  getCardPaymentRes,
} from '../test_support/payments';
import { DetailedPayment, FiatPayment } from '@circle-fin/circle-sdk';
import * as sinon from 'sinon';
import CardPaymentService from '../../src/services/CardPaymentService';
import GetCardPaymentAction from '../../src/actions/GetCardPaymentAction';
import CardPaymentRepo from '../../src/repositories/CardPaymentRepo';
import sleep from '../../src/utils/sleep';
import ERC20Repo from '../../src/repositories/ERC20Repo';
import UpdateFinishCardPaymentAction from '../../src/actions/UpdateFinishCardPaymentAction';
import TransactionRepo from '../../src/repositories/TransactionRepo';
import PaymentEntity, { Status } from '../../src/model/PaymentEntity';
import Container from 'typedi';
import CardGroupTransactionService from '../../src/services/CardGroupTransactionService';
import PropertyRepo from '../../src/repositories/PropertyRepo';
import BalanceRepo from '../../src/repositories/BalanceRepo';
import BalanceService from '../../src/services/BalanceService';
import GetExpiredPaymentsAction from '../../src/actions/GetExpiredPaymentsAction';
import UserRepo from '../../src/repositories/UserRepo';
import UserEntity from '../../src/model/UserEntity';
import PaymentRepo from '../../src/repositories/PaymentRepo';
import TransactionEntity from '../../src/model/TransactionsEntity';

const SUCCESS = 201;

describe('CARD PAYMENT WITH ERC20', () => {
  beforeEach(() => {
    sinon.restore();
  });
  it('handle card payment with erc20', async () => {
    if (process.env.TEST_CI) {
      sinon
        .stub(CardGroupTransactionService.prototype, 'circleCreateCardPayment')
        .resolves(cardPaymentRes as unknown as DetailedPayment);
      const validatedEmail = config.validatedEmails.split(',')[0];
      const accessToken = await login(server, validatedEmail);
      const property = await addProperty(server, validatedEmail);
      expect(property.body.availableTokens).to.eq(100);
      cardPayment.propertyId = property.body.id;
      await request(await server)
        .post('/api/v1/erc20')
        .send({
          propertyId: property.body.id,
          bankAccount: 'bank-account',
        })
        .set({ Authorization: `Bearer ${accessToken}` });
      await sleep(30000);
      let erc20 = await new ERC20Repo().find({
        property: { id: property.body.id },
      });
      expect(erc20[0].supply === erc20[0].currentSupply).to.eq(true);
      const response = await request(await server)
        .post('/api/v1/card-payment')
        .send(cardPayment)
        .set({ Authorization: `Bearer ${accessToken}` });
      expect(response.statusCode).to.eq(SUCCESS);
      expect(response.body.paymentId).to.eq(
        'e0bd57ea-ef4d-42a3-8e39-6e2dfff00a6c'
      );
      expect(response.body.property.id).to.eq(property.body.id);
      expect(response.body.user.email).to.eq(validatedEmail);
      const reserve = erc20[0].currentSupply && erc20[0].currentSupply - 1;
      erc20 = await new ERC20Repo().find({
        property: { id: property.body.id },
      });
      expect(erc20[0].reserveSupply).to.eq(reserve);
      const transactionStatus = (
        await new TransactionRepo().find({
          cardPayment: {
            id: response.body.id,
          },
        })
      )[0];
      expect(transactionStatus.paymentStatus).to.eq(Status.Process);
      await Container.get(UpdateFinishCardPaymentAction).update(
        response.body.id
      );
      const updatedCardPayment = await new CardPaymentRepo().find({
        id: response.body.id,
      });
      expect(updatedCardPayment[0].confirmed).to.eq(true);
      const transaction = await new TransactionRepo().find({
        cardPayment: { id: response.body.id },
      });
      expect(transaction[0].paymentStatus).to.eq(Status.Tokenized);
      erc20 = await new ERC20Repo().find({
        property: { id: property.body.id },
      });
      expect(erc20[0].reserveSupply).to.eq(erc20[0].currentSupply);
      const updatedProperty = await new PropertyRepo().find({
        id: property.body.id,
      });
      expect(updatedProperty[0].availableTokens).to.eq(99);
      const ew = await BalanceService.connectToEthersWrapper(
        erc20[0].contractAddress || ''
      );
      const balance = await new BalanceRepo().find({
        erc20: {
          id: erc20[0].id,
        },
      });
      const balanceInSC = await ew.balanceOfWallet(balance[0].account);
      expect(balance[0].confirmed).to.eq(true);
      expect(balanceInSC.toString()).to.eq('1000000000000000000');
      await omogenizePyamentTxnEndpoint(accessToken, transaction[0].id);
      await assertFinishFailedCardPaymentAction(
        response.body.id,
        erc20[0].reserveSupply,
        property.body.id
      );
    }
  });
  it('GET CARD PAYMENT from circle', async () => {
    sinon
      .stub(CardPaymentService.prototype, 'circleGetCardPayment')
      .resolves(getCardPaymentRes as unknown as FiatPayment);
    const response = await Container.get(GetCardPaymentAction).get(
      '0e851028-2c66-4842-8eda-9d4eb8e27544'
    );
    expect(response.type).to.eq('payment');
  });
  it('update expired payments', async () => {
    const validatedEmail = config.validatedEmails.split(',')[0];
    const accessToken = await login(server, validatedEmail);
    const property = await addProperty(server, validatedEmail);
    const payment = {
      ...createPaymentIntentWalletData,
    } as unknown as PaymentEntity;
    payment.paymentIntentId = uuidv4();
    payment.paymentIds = [uuidv4()];
    payment.id = uuidv4();
    payment.status = Status.Started;
    payment.createDate = new Date().toISOString();
    payment.updateDate = new Date().toISOString();
    payment.user = (await new UserRepo().findOne({
      email: validatedEmail,
    })) as UserEntity;
    payment.property = property.body[0];
    payment.expiresOn = new Date().toISOString();

    await new PaymentRepo().save(payment);
    const payments: PaymentEntity[] = await Container.get(
      GetExpiredPaymentsAction
    ).get();
    expect(Boolean(payments.length)).to.eq(true);
  });
});

async function assertFinishFailedCardPaymentAction(
  cardPaymentId: string,
  reserveBefore: number,
  propertyId: string
) {
  await Container.get(UpdateFinishCardPaymentAction).update(
    cardPaymentId,
    'failed'
  );

  const erc20 = await new ERC20Repo().find({
    property: { id: propertyId },
  });

  expect(erc20[0].reserveSupply).to.eq(reserveBefore + 1);
  const updatedCardPayment = await new CardPaymentRepo().find({
    id: cardPaymentId,
  });
  expect(updatedCardPayment[0].confirmed).to.eq(true);
  const transaction = (
    await new TransactionRepo().find({
      cardPayment: { id: cardPaymentId },
    })
  )[0];
  expect(transaction.paymentStatus).to.eq(Status.Error);
}

async function omogenizePyamentTxnEndpoint(
  accessToken: string,
  transactionId: string
) {
  const transactions = await request(await server)
    .get('/api/v1/transaction')
    .set({ Authorization: `Bearer ${accessToken}` });
  const transaction = transactions.body.find(
    (i: TransactionEntity) => i.id === transactionId
  );
  expect(Boolean(transaction.payment.createDate)).to.eq(true);
  expect(transaction.payment.status).to.eq(Status.Paid);
  expect(transaction.paymentStatus).to.eq(Status.Tokenized);
  expect(transaction.payment.address).to.eq('');
}
