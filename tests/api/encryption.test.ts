import * as request from 'supertest';
import { expect } from 'chai';
import server from '../test_support/server';
import config from '../../src/config/default';
import { login } from '../test_support';
import * as sinon from 'sinon';
import EncryptionService from '../../src/services/EncryptionService';
import { encryptionRes } from '../test_support/payments';
import { PublicKeyData } from '../../src/controllers/v1/GetEncryptionPublicKeyController';

const SUCCESS = 200;

describe('CIRCLE', () => {
  it('Encryption', async () => {
    sinon
      .stub(EncryptionService.prototype, 'circleGetEncryption')
      .resolves(encryptionRes as unknown as PublicKeyData);
    const validatedEmail = config.validatedEmails.split(',')[0];
    const accessToken = await login(server, validatedEmail);

    const response = await request(await server)
      .get('/api/v1/encryption/public-key')
      .set({ Authorization: `Bearer ${accessToken}` });
    expect(response.statusCode).to.eq(SUCCESS);
    expect(response.body.keyId).to.be.eq('key1');
    expect(response.body.publicKey).to.be.eq('publicKey');
  });
});
