import { v4 as uuidv4 } from 'uuid';

const cardPayment = {
  metadata: {
    email: 'satoshi@circle.com',
    phoneNumber: '+14155555555',
  },
  amount: { currency: 'USD', amount: '100' },
  autoCapture: true,
  source: { id: 'b8627ae8-732b-4d25-b947-1df8f4007a29', type: 'card' },
  keyId: 'key1',
  idempotencyKey: uuidv4(),
  verification: 'cvv',
  verificationSuccessUrl: 'https://www.example.com/3ds/verificationsuccessful',
  verificationFailureUrl: 'https://www.example.com/3ds/verificationfailure',
  description: 'Payment',
  encryptedData: 'UHVibGljS2V5QmFzZTY0RW5jb2RlZA==',
  channel: 'ba943ff1-ca16-49b2-ba55-1057e70ca5c7',
  propertyId: '',
};

const cardPaymentRes = {
  id: 'e0bd57ea-ef4d-42a3-8e39-6e2dfff00a6c',
  type: 'payment',
  status: 'failed',
  description: 'Payment',
  amount: { amount: '100', currency: 'USD' },
  createDate: '2022-11-15T12:58:37.872Z',
  updateDate: '2022-11-15T12:58:38.055190Z',
  merchantId: 'df0052d4-5ffc-4ac3-a1f2-e81f59364b95',
  merchantWalletId: '1002482933',
  source: { id: 'b8627ae8-732b-4d25-b947-1df8f4007a29', type: 'card' },
  errorCode: 'payment_unprocessable',
  refunds: [],
  metadata: { email: 'satoshi@circle.com' },
  channel: 'ba943ff1-ca16-49b2-ba55-1057e70ca5c7',
};

const card = {
  billingDetails: {
    name: 'Satoshi Nakamoto',
    country: 'US',
    city: 'Boston',
    line1: '100 Money Street',
    line2: 'Suite 1',
    district: 'MA',
    postalCode: '01234',
  },
  metadata: {
    email: 'satoshi@circle.com',
    phoneNumber: '+14155555555',
    sessionId: 'DE6FA86F60BB47B379307F851E238617',
    ipAddress: '244.28.239.130',
  },
  idempotencyKey: uuidv4(),
  keyId: 'key1',
  encryptedData:
    'LS0tLS1CRUdJTiBQR1AgTUVTU0FHRS0tLS0tCgp3Y0JNQTBYV1NGbEZScFZoQVFmL2J2bVVkNG5LZ3dkbExKVTlEdEFEK0p5c0VOTUxuOUlRUWVGWnZJUWEKMGgzQklpRFNRU0RMZmI0NEs2SXZMeTZRbm54bmFLcWx0MjNUSmtPd2hGWFIrdnNSMU5IbnVHN0lUNWJECmZzeVdleXlNK1JLNUVHV0thZ3NmQ2tWamh2NGloY29xUnlTTGtJbWVmRzVaR0tMRkJTTTBsTFNPWFRURQpiMy91eU1zMVJNb3ZiclNvbXkxa3BybzUveWxabWVtV2ZsU1pWQlhNcTc1dGc1YjVSRVIraXM5ckc0cS8KMXl0M0FOYXA3UDhKekFhZVlyTnVNZGhGZFhvK0NFMC9CQnN3L0NIZXdhTDk4SmRVUEV0NjA5WFRHTG9kCjZtamY0YUtMQ01xd0RFMkNVb3dPdE8vMzVIMitnVDZKS3FoMmtjQUQyaXFlb3luNWcralRHaFNyd3NKWgpIdEphQWVZZXpGQUVOaFo3Q01IOGNsdnhZVWNORnJuNXlMRXVGTkwwZkczZy95S3loclhxQ0o3UFo5b3UKMFVxQjkzQURKWDlJZjRBeVQ2bU9MZm9wUytpT2lLall4bG1NLzhlVWc3OGp1OVJ5T1BXelhyTzdLWTNHClFSWm8KPXc1dEYKLS0tLS1FTkQgUEdQIE1FU1NBR0UtLS0tLQo',
  expMonth: 1,
  expYear: 2020,
};

const cardCreationRes = {
  id: '8db60290-ceac-4d47-aebc-8e4d07017717',
  status: 'complete',
  last4: '0008',
  billingDetails: {
    name: 'Satoshi Nakamoto',
    line1: '100 Money Street',
    line2: 'Suite 1',
    city: 'Boston',
    postalCode: '01234',
    district: 'MA',
    country: 'US',
  },
  expMonth: 1,
  expYear: 2020,
  network: 'VISA',
  bin: '400740',
  issuerCountry: 'ES',
  fundingType: 'debit',
  fingerprint: '603b2185-1901-4eae-9b98-cc20c32d0709',
  verification: { cvv: 'pending', avs: 'pending' },
  createDate: '2022-11-30T11:36:26.508Z',
  metadata: { phoneNumber: '+14155555555', email: 'satoshi@circle.com' },
  updateDate: '2022-11-30T12:01:14.108Z',
  cardId: '18295e85-310d-4a55-86bc-2e2cd157615c',
};

const cardPaymentResOk = {
  id: 'e3ea2563-10f3-480e-8064-41c5617d419c',
  type: 'payment',
  status: 'pending',
  description: 'Payment',
  amount: { amount: '5.04', currency: 'USD' },
  createDate: '2022-12-01T09:13:26.319Z',
  updateDate: '2022-12-01T09:13:26.319Z',
  merchantId: 'df0052d4-5ffc-4ac3-a1f2-e81f59364b95',
  merchantWalletId: '1002482933',
  source: { id: 'a64d03f1-673d-480b-bd07-835873ec5c60', type: 'card' },
  refunds: [],
  metadata: { phoneNumber: '+14155555555', email: 'satoshi@circle.com' },
  channel: 'ba943ff1-ca16-49b2-ba55-1057e70ca5c7',
  paymentId: 'd5a39222-43b5-453c-99f1-4d7bbc8db08a',
  autoCapture: null,
  keyId: null,
  verification: null,
  verificationSuccessUrl: null,
  verificationFailureUrl: null,
  encryptedData: null,
  deletedAt: null,
  createdAt: '2022-12-01T08:13:26.361Z',
  updatedAt: '2022-12-01T08:13:26.361Z',
};

const encryptionRes = {
  keyId: 'key1',
  publicKey: 'publicKey',
};

const getCardPaymentRes = {
  id: '750027bd-f0b4-4b62-814d-9a6579621598',
  type: 'payment',
  status: 'failed',
  description: 'Payment',
  amount: { amount: '5.84', currency: 'USD' },
  createDate: '2022-12-01T09:15:35.736Z',
  updateDate: '2022-12-01T09:15:36.001536Z',
  merchantId: 'df0052d4-5ffc-4ac3-a1f2-e81f59364b95',
  merchantWalletId: '1002482933',
  source: { id: 'a64d03f1-673d-480b-bd07-835873ec5c60', type: 'card' },
  errorCode: 'payment_unprocessable',
  refunds: [],
  metadata: { phoneNumber: '+14155555555', email: 'satoshi@circle.com' },
  channel: 'ba943ff1-ca16-49b2-ba55-1057e70ca5c7',
};

export {
  cardPayment,
  card,
  cardCreationRes,
  cardPaymentRes,
  encryptionRes,
  getCardPaymentRes,
};
