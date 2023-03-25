import * as request from 'supertest';
import { expect } from 'chai';
import server from '../test_support/server';
import config from '../../src/config/default';
import { login } from '../test_support';
import UserRepo from '../../src/repositories/UserRepo';

const SUCCESS = 200;

const userUpdateData = {
  wallet: 'WALLETTEST',
};

describe('USER', () => {
  it('Update', async () => {
    const validatedEmail = config.validatedEmails.split(',')[0];
    const accessToken = await login(server, validatedEmail);

    const response = await request(await server)
      .put('/api/v1/user')
      .send(userUpdateData)
      .set({ Authorization: `Bearer ${accessToken}` });
    expect(response.statusCode).to.eq(SUCCESS);
    const user = await new UserRepo().findOne({
      email: validatedEmail,
    });
    expect(user?.wallet).to.be.eq(userUpdateData.wallet);
  });
});
