import { Body, HttpCode, Post } from 'routing-controllers';
import { Controller } from '../../layers';
import UpsertKycApplicantAction from '../../actions/UpsertKycApplicantAction';
import KycEntity from '../../model/KycEntity';

@Controller('/api/v1')
export default class KycApplicantReviewedWebhookController {
  constructor(readonly upsertKycApplicantAction: UpsertKycApplicantAction) {}
  @HttpCode(200)
  @Post('/kyc/applicant-reviewed-webhook')
  async create(
    @Body()
      body: KycEntity
  ) {
    await this.upsertKycApplicantAction.do(body);
    return {};
  }
}
