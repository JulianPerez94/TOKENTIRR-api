import * as request from 'supertest';
import { expect } from 'chai';
import server from '../test_support/server';
import config from '../../src/config/default';
import { login } from '../test_support';

const SUCCESS = 201;

const createWalletData = {
  description: 'desc',
  propertyId: 'propertyId1',
};

const createWalletAddressData = {
  walletId: '1009652094',
  currency: 'USD',
  chain: 'ETH',
};

describe('CIRCLE', () => {
  it('CREATE WALLET', async () => {
    const validatedEmail = config.validatedEmails.split(',')[0];
    const accessToken = await login(server, validatedEmail);

    const response = await request(await server)
      .post('/api/v1/wallet')
      .send(createWalletData)
      .set({ Authorization: `Bearer ${accessToken}` });
    expect(response.statusCode).to.eq(SUCCESS);
    expect(response.body.propertyId).to.eq(createWalletData.propertyId);
  });

  it('CREATE WALLET ADDRESS', async () => {
    const validatedEmail = config.validatedEmails.split(',')[0];
    const accessToken = await login(server, validatedEmail);

    const response = await request(await server)
      .post('/api/v1/wallet/address')
      .send(createWalletAddressData)
      .set({ Authorization: `Bearer ${accessToken}` });
    expect(response.statusCode).to.eq(SUCCESS);
    // expect(response.body.address).to.eq(
    //   '-0x8059172d5210f8029aa4101b5996275bda9d7b77'
    // );
    expect(response.body.currency).to.eq('USD');
    expect(response.body.chain).to.eq('ETH');
  });
});
