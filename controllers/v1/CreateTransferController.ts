import { Authorized, Body, HttpCode, Post } from 'routing-controllers';
import { Controller } from '../../layers';
import CreateTransferAction from '../../actions/CreateTransferAction';
import { Currency, Chain } from '@circle-fin/circle-sdk';

type BlockchainDestination = {
  type: 'wallet';
  id: string;
};

type walletDestination = {
  type: 'blockchain';
  address: string;
  addressTag?: string;
  chain: Chain;
};

export type CreateTransferInfo = {
  source: { type: 'wallet'; id: string };
  destination: BlockchainDestination | walletDestination;
  amount: { amount: string; currency: Currency };
  idempotencyKey: string;
};

export type CreateTransferResponse = {
  address: string;
  currency: Currency;
  chain: Chain;
};

@Controller('/api/v1')
export default class CreateTransferController {
  constructor(readonly createTransferAction: CreateTransferAction) {}
  @HttpCode(201)
  @Post('/transfer')
  @Authorized()
  async create(
    @Body()
      body: CreateTransferInfo
  ): Promise<CreateTransferResponse> {
    return (await this.createTransferAction.do(
      body
    )) as unknown as CreateTransferResponse;
  }
}
