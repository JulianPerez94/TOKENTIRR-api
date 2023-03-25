import * as request from 'supertest';
import { expect } from 'chai';
import server from '../test_support/server';

const SUCCESS = 200;

describe('Marketplace', () => {
  it('can serve properties in our system', async () => {
    const response = await request(await server).get('/api/v1/marketplace');
    expect(response.statusCode).to.eq(SUCCESS);
    expect(response.body.length > 0).to.eq(true);
  });
});
