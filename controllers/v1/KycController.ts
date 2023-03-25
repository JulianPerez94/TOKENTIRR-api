import { Authorized, CurrentUser, Get, HttpCode } from 'routing-controllers';
import { Controller } from '../../layers';
import { DeepPartial } from 'typeorm';
import User from '../../model/UserEntity';
import GetKycAccessToken from '../../actions/GetKycAccessTokenAction';

export type AccessTokenResponse = {
  token: string;
  userId: string;
};

@Controller('/api/v1/kyc')
export default class KycController {
  constructor(readonly getKycAccessToken: GetKycAccessToken) {}
  @HttpCode(200)
  @Get('/accessToken')
  @Authorized()
  async index(
    @CurrentUser() user: DeepPartial<User>
  ): Promise<AccessTokenResponse> {
    if (!user.id) {
      const error = new Error('user not found');
      throw error;
    }

    return await this.getKycAccessToken.get(user.id);
  }
}
