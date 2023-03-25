import * as request from 'supertest';
import { expect } from 'chai';
import server from '../test_support/server';
import config from '../../src/config/default';
import { login } from '../test_support';
import { v4 as uuidv4 } from 'uuid';

const SUCCESS = 201;

const createTransferWalletData = {
  source: { type: 'wallet', id: '1009690815' },
  destination: { type: 'wallet', id: '1009690826' },
  amount: { amount: '0.01', currency: 'USD' },
  idempotencyKey: uuidv4(),
};

const createTransferBlockchainData = {
  source: { type: 'wallet', id: '123410096520945' },
  destination: {
    type: 'blockchain',
    address: '0x9c8698661f3ace77a7101e69dc51e89d1bd89e5d',
    chain: 'ETH',
  },
  amount: { amount: '100', currency: 'USD' },
  idempotencyKey: uuidv4(),
};

describe('CIRCLE', () => {
  it('CREATE TRANSFER TO WALLET', async () => {
    const validatedEmail = config.validatedEmails.split(',')[0];
    const accessToken = await login(server, validatedEmail);

    const response = await request(await server)
      .post('/api/v1/transfer')
      .send(createTransferWalletData)
      .set({ Authorization: `Bearer ${accessToken}` });
    expect(response.statusCode).to.eq(SUCCESS);
    // expect(response.body.propertyId).to.eq(createWalletData.propertyId);
  });

  // it('CREATE TRANSFER TO BLOCKCHAIN', async () => {
  //   const validatedEmail = config.validatedEmails.split(',')[0];
  //   const accessToken = await login(server, validatedEmail);

  //   const response = await request(await server)
  //     .post('/api/v1/transfer')
  //     .send(createTransferBlockchainData)
  //     .set({ Authorization: `Bearer ${accessToken}` });
  //   expect(response.statusCode).to.eq(SUCCESS);
  //   // expect(response.body.address).to.eq(
  //   //   '-0x8059172d5210f8029aa4101b5996275bda9d7b77'
  //   // );
  //   console.log(
  //     '🚀 ~ file: transfer.test.ts ~ line 56 ~ it ~ response',
  //     response.body
  //   );
  // });
});
