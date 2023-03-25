import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';

const login = async (server: unknown, email = `${uuidv4()}@test.com`) => {
  let response = await request(await server)
    .post('/api/v1/login')
    .send({
      email,
      password: 'testpass',
    });
  if (response?.body?.accessToken) {
    return response.body.accessToken;
  } else {
    await request(await server)
      .post('/api/v1/register')
      .send({
        email,
        password: 'testpass',
      });
    response = await request(await server)
      .post('/api/v1/login')
      .send({
        email,
        password: 'testpass',
      });
    return response.body.accessToken;
  }
};
const createPaymentIntentWalletData = {
  amount: { amount: '100', currency: 'USD' },
  amountPaid: { currency: 'USD' },
  paymentMethods: [{ type: 'blockchain', chain: 'ETH' }],
  idempotencyKey: uuidv4(),
  settlementCurrency: 'USD',
  propertyId: uuidv4(),
};

const paymentRes = {
  id: '94b4da3f-bfb8-4bba-87ad-295da42b7407',
  amount: { amount: '100', currency: 'USD' },
  amountPaid: { amount: '0.00', currency: 'USD' },
  settlementCurrency: 'USD',
  paymentMethods: [{ type: 'blockchain', chain: 'ETH' }],
  paymentIds: [],
  timeline: [{ status: 'created', time: '2022-11-18T11:45:12.804513Z' }],
  createDate: '2022-11-18T11:45:12.803995Z',
  updateDate: '2022-11-18T11:45:12.803995Z',
};

const paidPayment = {
  Message:
    '{"clientId":"eb941173-3261-462d-b5ed-b9cf51720122","notificationType":"payments","version":1,"customAttributes":{"clientId":"eb941173-3261-462d-b5ed-b9cf51720122"},"payment":{"id":"18d67ade-f8da-3f70-9fe5-3b2c7cb3270d","type":"payment","status":"paid","amount":{"amount":"100.00","currency":"USD"},"createDate":"2022-11-29T08:17:40.315Z","updateDate":"2022-11-29T08:17:40.316Z","merchantId":"eb941173-3261-462d-b5ed-b9cf51720122","merchantWalletId":"1010142611","paymentIntentId":"a84a37b7-309d-4ac3-badc-af7999b078c2","depositAddress":{"chain":"ETH","address":"0x04ccf9f082efad08d85455e0b4b74125ef7a088b"},"transactionHash":"0x0a685cdd12f3b5ac4f370b1cc1b948abe4ac54a8d86c45ee3c7d28a80d8eea9b"}}',
};
const paymentIntent = {
  Message:
    '{"clientId":"eb941173-3261-462d-b5ed-b9cf51720122","notificationType":"paymentIntents","version":1,"customAttributes":{"clientId":"eb941173-3261-462d-b5ed-b9cf51720122"},"paymentIntent":{"id":"a84a37b7-309d-4ac3-badc-af7999b078c2","amount":{"amount":"100.00","currency":"USD"},"amountPaid":{"amount":"0.00","currency":"USD"},"amountRefunded":{"amount":"0.00","currency":"USD"},"settlementCurrency":"USD","paymentMethods":[{"type":"blockchain","chain":"ETH","address":"0x04ccf9f082efad08d85455e0b4b74125ef7a088b"}],"fees":[{"type":"blockchainLeaseFee","amount":"0.00","currency":"USD"}],"paymentIds":[],"refundIds":[],"timeline":[{"status":"pending","time":"2022-11-29T08:14:42.503665Z"},{"status":"created","time":"2022-11-29T08:14:39.924798Z"}],"createDate":"2022-11-29T08:14:39.924314Z","updateDate":"2022-11-29T08:14:42.501437Z","expiresOn":"2022-11-29T16:14:42.428002Z"}}',
};

const applicantLogin = async (
  server: unknown,
  email = `${uuidv4()}@test.com`
) => {
  let response = await request(await server)
    .post('/api/v1/login')
    .send({
      email,
      password: 'testpass',
    });
  if (response?.body?.accessToken) {
    return response.body.accessToken;
  } else {
    await request(await server)
      .post('/api/v1/register')
      .send({
        email,
        password: 'testpass',
      });
    response = await request(await server)
      .post('/api/v1/login')
      .send({
        email,
        password: 'testpass',
      });
    return {
      accessToken: response.body.accessToken,
      email,
    };
  }
};

const addProperty = async (server: unknown, email = `${uuidv4()}@test.com`) => {
  const accessToken = await login(server, email);
  return await request(await server)
    .post('/api/v1/property')
    .send(propertyToTest)
    .set({ Authorization: `Bearer ${accessToken}` });
};

const propertyToTest = {
  id: uuidv4(),
  mainImage:
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1kPpHvPHPybsi-XMIGAt2HHCzfV44nEroDA&usqp=CAU',
  street: 'El prado',
  streetNumber: '2',
  city: 'Kisap',
  state: 'Teletubismo',
  description: 'Descripción de la vivienda tokentirr',
  images: [
    'https://live.staticflickr.com/101/255122840_5c7eb14c3b_b.jpg',
    'https://barnlake.com/images/slideshow/000bBarnlake-House.jpg',
    'https://live.staticflickr.com/5810/31231003161_9d98f15546_b.jpg',
  ],
  postalCode: '1112',
  tokenPrice: 100000,
  fiatTotalPrice: 10000000000,
  availableTokens: 100,
  totalTokens: 10000000000 / 100000,
  closingCosts: 1000000,
  companyIncorporationExpenses: 600000,
  initialMaintenanceReserve: 1000000,
  vacancyReserve: 1000000,
  tokentirrFee: 1000000,
  irr: 14280,
  roi: 8000,
  inversionAverageValue: 6280,
  annualGrossRents: 15600000,
  municipalTaxes: 1200000,
  homeownersInsurance: 955000,
  propertyManagement: 801000,
  llcAndFilingFees: 500000,
  annualCashFlow: 12435,
  monthlyCashFlow: 1011,
};

export {
  login,
  applicantLogin,
  addProperty,
  propertyToTest,
  createPaymentIntentWalletData,
  paymentRes,
  paidPayment,
  paymentIntent,
};
