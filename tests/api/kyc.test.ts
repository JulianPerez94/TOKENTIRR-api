import * as request from 'supertest';
import { expect } from 'chai';
import server from '../test_support/server';
import { login, applicantLogin } from '../test_support';
import {
  applicantCreatedToTest,
  applicantReviewedGreenToTest,
  applicantReviewedRedToTest,
} from '../test_support/kycWebhook';
import UserRepo from '../../src/repositories/UserRepo';
import { v4 as uuidv4 } from 'uuid';
import KycRepo from '../../src/repositories/KycRepo';

const SUCCESS = 200;
const applicantId = uuidv4();

describe('KYC', () => {
  it('Get access token', async () => {
    const accessToken = await login(server);
    const response = await request(await server)
      .get('/api/v1/kyc/accessToken')
      .set({ Authorization: `Bearer ${accessToken}` });

    expect(response.statusCode).to.eq(SUCCESS);
  });

  it('Create applicant webhook', async () => {
    const { accessToken, email } = await applicantLogin(server);
    let user = new UserRepo();
    let validatedUser = await user.findOne({ email });
    applicantCreatedToTest.externalUserId = validatedUser?.id || '';
    applicantCreatedToTest.applicantId = applicantId;
    const response = await request(await server)
      .post('/api/v1/kyc/applicant-created-webhook')
      .send(applicantCreatedToTest)
      .set({ Authorization: `Bearer ${accessToken}` });

    expect(response.statusCode).to.eq(SUCCESS);

    user = new UserRepo();
    validatedUser = await user.findOne({ email });
    expect(validatedUser?.kyc?.externalUserId).to.eq(validatedUser?.id);
  });

  it('GREEN Reviewed applicant webhook', async () => {
    const { accessToken, email } = await applicantLogin(server);
    const user = new UserRepo();
    const validatedUser = await user.findOne({ email });
    applicantReviewedGreenToTest.externalUserId = validatedUser?.id || '';
    applicantReviewedGreenToTest.applicantId = applicantId;
    const response = await request(await server)
      .post('/api/v1/kyc/applicant-reviewed-webhook')
      .send(applicantReviewedGreenToTest)
      .set({ Authorization: `Bearer ${accessToken}` });

    expect(response.statusCode).to.eq(SUCCESS);

    const kycRepo = new KycRepo();
    const kyc = await kycRepo.findOne({ applicantId });
    expect(kyc?.reviewResult?.reviewAnswer).to.eq('GREEN');
  });

  it('RED Reviewed applicant webhook', async () => {
    const { accessToken, email } = await applicantLogin(server);
    const user = new UserRepo();
    const validatedUser = await user.findOne({ email });
    applicantReviewedRedToTest.externalUserId = validatedUser?.id || '';
    applicantReviewedRedToTest.applicantId = applicantId;
    const response = await request(await server)
      .post('/api/v1/kyc/applicant-reviewed-webhook')
      .send(applicantReviewedRedToTest)
      .set({ Authorization: `Bearer ${accessToken}` });

    expect(response.statusCode).to.eq(SUCCESS);

    const kycRepo = new KycRepo();
    const kyc = await kycRepo.findOne({ applicantId });

    expect(kyc?.reviewResult?.reviewAnswer).to.eq('RED');
  });
});
