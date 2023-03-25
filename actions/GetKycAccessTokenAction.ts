import { Action } from '../layers';
import KycService from '../services/KycService';

@Action()
export default class GetKycAccessTokenAction {
  constructor(readonly kycService: KycService) {}

  async get(userId: string) {
    return await this.kycService.getAccessToken(userId);
  }
}
