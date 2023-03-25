import * as request from 'supertest';
import { expect } from 'chai';
import server from '../test_support/server';
import config from '../../src/config/default';
import {
  addProperty,
  createPaymentIntentWalletData,
  login,
  paymentRes,
} from '../test_support';
import * as sinon from 'sinon';
import PaymentIntentService from '../../src/services/PaymentIntentService';
import { PaymentIntent } from '@circle-fin/circle-sdk';

const SUCCESS = 201;

describe('CIRCLE', () => {
  beforeEach(() => {
    sinon.restore();
  });
  it('create payment intent', async () => {
    sinon
      .stub(PaymentIntentService.prototype, 'circleCreatePaymentIntent')
      .resolves(paymentRes as unknown as PaymentIntent);

    const validatedEmail = config.validatedEmails.split(',')[0];
    const accessToken = await login(server, validatedEmail);
    const { body: property } = await addProperty(server, validatedEmail);
    createPaymentIntentWalletData.propertyId = property.id;
    const response = await request(await server)
      .post('/api/v1/payment-intent')
      .send(createPaymentIntentWalletData)
      .set({ Authorization: `Bearer ${accessToken}` });
    expect(response.statusCode).to.eq(SUCCESS);
    expect(response.body.settlementCurrency).to.eq('USD');
    expect(response.body.property.id).to.eq(
      createPaymentIntentWalletData.propertyId
    );
    expect(response.body.user.email).to.eq(validatedEmail);
    expect(Boolean(response.body.paymentIntentId)).to.eq(true);
  });
});
