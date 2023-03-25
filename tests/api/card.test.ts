import * as request from 'supertest';
import { expect } from 'chai';
import server from '../test_support/server';
import config from '../../src/config/default';
import { login } from '../test_support';
import { card, cardCreationRes } from '../test_support/payments';
import CardService from '../../src/services/CardService';
import { Card } from '@circle-fin/circle-sdk';
import * as sinon from 'sinon';

const SUCCESS = 201;

describe('CIRCLE', () => {
  beforeEach(() => {
    sinon.restore();
  });
  it('card error', async () => {
    const cardToTestError = { ...card };
    cardToTestError.billingDetails.name = 'OnlyName';
    const validatedEmail = config.validatedEmails.split(',')[0];
    const accessToken = await login(server, validatedEmail);
    const response = await request(await server)
      .post('/api/v1/card')
      .send(card)
      .set({ Authorization: `Bearer ${accessToken}` });
    expect(response.statusCode).to.eq(500);
    expect(response.body.message).to.eq(
      'Error creating card on circle: [1094]-Last name can not be empty'
    );
  });
  it('card', async () => {
    sinon
      .stub(CardService.prototype, 'circleCreateCard')
      .resolves(cardCreationRes as unknown as Card);
    const validatedEmail = config.validatedEmails.split(',')[0];
    const accessToken = await login(server, validatedEmail);
    const response = await request(await server)
      .post('/api/v1/card')
      .send(card)
      .set({ Authorization: `Bearer ${accessToken}` });
    expect(response.statusCode).to.eq(SUCCESS);
    expect(response.body.status).to.eq('complete');
    expect(response.body.last4).to.eq('0008');
  });
});
