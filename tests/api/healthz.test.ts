import * as request from 'supertest';
import { expect } from 'chai';
import server from '../test_support/server';

const SUCCESS = 200;

describe('API', () => {
  it('Server is available', async () => {
    const response = await request(await server).get('/api/v1/healthz');
    expect(response.statusCode).to.eq(SUCCESS);
    expect(response.body.status).to.be.eq('ok');
  });
});
