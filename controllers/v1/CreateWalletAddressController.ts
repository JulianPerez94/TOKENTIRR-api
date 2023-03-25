import { Authorized, Body, HttpCode, Post } from 'routing-controllers';
import { Controller } from '../../layers';
import CreateWalletAddressAction from '../../actions/CreateWalletAddressAction';
import { Currency, Chain } from '@circle-fin/circle-sdk';

export type CreateWalletAddressInfo = {
  walletId: string;
  currency: Currency;
  chain: Chain;
};

export type CreateWalletAddressResponse = {
  address: string;
  currency: Currency;
  chain: Chain;
};

@Controller('/api/v1')
export default class CreateWalletAddressController {
  constructor(readonly createWalletAddressAction: CreateWalletAddressAction) {}
  @HttpCode(201)
  @Post('/wallet/address')
  @Authorized()
  async create(
    @Body()
      body: CreateWalletAddressInfo
  ): Promise<CreateWalletAddressResponse> {
    return (await this.createWalletAddressAction.do(
      body
    )) as unknown as CreateWalletAddressResponse;
  }
}
