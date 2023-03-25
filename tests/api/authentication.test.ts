import * as request from 'supertest';
import { expect } from 'chai';
import { v4 as uuidv4 } from 'uuid';
import server from '../test_support/server';

const SUCCESS = 200;
const CREATED = 201;
const CONFLICT = 409;

describe('Unregistered user', () => {
  it('can register into tokentirr', async () => {
    const email = `${uuidv4()}@test.com`;

    const response = await request(await server)
      .post('/api/v1/register')
      .send({
        email,
        password: 'testpass',
      });

    expect(response.statusCode).to.eq(CREATED);
    expect(Boolean(response.body.id)).to.be.true;
    expect(response.body.email).to.eq(email);
    expect(response.body.password).to.eq(undefined);
  });

  it('cannot register twice into tokentirr', async () => {
    const email = `${uuidv4()}@test.com`;

    await request(await server)
      .post('/api/v1/register')
      .send({
        email,
        password: 'testpass',
      });
    const response = await request(await server)
      .post('/api/v1/register')
      .send({
        email,
        password: 'testpass',
      });
    expect(response.statusCode).to.eq(CONFLICT);
    expect(response.body.message).to.eq('User exist');
  });
});

describe('Login', async () => {
  const email = `${uuidv4()}@test.com`;

  await request(await server)
    .post('/api/v1/register')
    .send({
      email,
      password: 'testpass',
    });
  it('unlogged user cannot access to status', async () => {
    const response = await request(await server).get('/api/v1/status');
    expect(response.statusCode).to.eq(401);
    expect(response.body.message).to.eq('You are not authorized');
  });

  it('logged user can access to healthz', async () => {
    let response = await request(await server)
      .post('/api/v1/login')
      .send({
        email,
        password: 'testpass',
      });
    response = await request(await server)
      .get('/api/v1/erc20')
      .set({ Authorization: `Bearer ${response.body.accessToken}` });

    expect(response.statusCode).to.eq(SUCCESS);
    expect(response.body.status).to.eq('ok');
  });
});
