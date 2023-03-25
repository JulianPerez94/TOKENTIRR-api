import { Action } from '../layers';
import KycService from '../services/KycService';
import KycEntity from '../model/KycEntity';

@Action()
export default class UpsertKycApplicantAction {
  constructor(readonly kycService: KycService) {}

  async do(applicant: KycEntity) {
    return await this.kycService.upsertKycApplicant(applicant);
  }
}
