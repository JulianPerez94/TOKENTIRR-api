import { v4 as uuidv4 } from 'uuid';

const applicantCreatedToTest = {
  applicantId: uuidv4(),
  inspectionId: 'inspectionId',
  correlationId: 'inspectionId',
  levelName: 'levelName',
  externalUserId: 'externalUserId',
  type: 'type',
  sandboxMode: true,
  reviewStatus: 'created',
  createdAt: '2020-02-21 13:23:19+0000',
  clientId: 'clientId',
};

const applicantReviewedGreenToTest = {
  applicantId: uuidv4(),
  inspectionId: 'inspectionId',
  correlationId: 'inspectionId',
  externalUserId: 'externalUserId',
  levelName: 'levelName',
  type: 'applicantReviewed',
  reviewResult: {
    reviewAnswer: 'GREEN',
  },
  reviewStatus: 'completed',
  createdAt: '2020-02-21 13:23:19+0000',
};

const applicantReviewedRedToTest = {
  applicantId: uuidv4(), // applicant ID
  inspectionId: 'inspectionId', // applicant's inspection ID
  correlationId: 'inspectionId',
  externalUserId: 'externalUserId',
  levelName: 'levelName',
  type: 'applicantReviewed',
  reviewResult: {
    moderationComment:
      'We could not verify your profile. Please contact support: support@sumsub.com',
    clientComment: ' Suspected fraudulent account.',
    reviewAnswer: 'RED',
    rejectLabels: ['UNSATISFACTORY_PHOTOS', 'GRAPHIC_EDITOR', 'FORGERY'],
    reviewRejectType: 'FINAL',
  },
  reviewStatus: 'completed',
  createdAt: '2020-02-21 13:23:19+0000',
};

export {
  applicantCreatedToTest,
  applicantReviewedGreenToTest,
  applicantReviewedRedToTest,
};
