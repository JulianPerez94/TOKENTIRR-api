import { Authorized, Body, HttpCode, Post } from 'routing-controllers';
import { Controller } from '../../layers';
import CreateWalletAction from '../../actions/CreateWalletAction';
import WalletEntity from '../../model/WalletEntity';

export type CreateWalletInfo = {
  description: string;
  propertyId: string;
};

@Controller('/api/v1')
export default class CreateWalletController {
  constructor(readonly createWalletAction: CreateWalletAction) {}
  @HttpCode(201)
  @Post('/wallet')
  @Authorized()
  async create(
    @Body()
      body: CreateWalletInfo
  ): Promise<WalletEntity> {
    return (await this.createWalletAction.do(body)) as WalletEntity;
  }
}
