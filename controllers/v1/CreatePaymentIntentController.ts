import {
  Authorized,
  Body,
  CurrentUser,
  HttpCode,
  Post,
} from 'routing-controllers';
import { Controller } from '../../layers';
import CreatePaymentIntentAction from '../../actions/CreatePaymentIntentAction';
import {
  Chain,
  CryptoPaymentsMoneyCurrencyEnum,
  PaymentIntentSettlementCurrencyEnum,
} from '@circle-fin/circle-sdk';
import { DeepPartial } from 'typeorm';
import UserEntity from '../../model/UserEntity';

export type CreatePaymentIntentInfo = {
  amount: { amount: string; currency: CryptoPaymentsMoneyCurrencyEnum };
  amountPaid: { amount: string; currency: 'USD' };
  paymentMethods: [{ type: 'blockchain'; chain: Chain }];
  idempotencyKey: string;
  settlementCurrency: PaymentIntentSettlementCurrencyEnum;
  propertyId?: string; // SGP REVISAR
};

@Controller('/api/v1')
export default class CreatePaymentIntentController {
  constructor(readonly createPaymentIntentAction: CreatePaymentIntentAction) {}
  @HttpCode(201)
  @Post('/payment-intent')
  @Authorized()
  async create(
    @Body()
      body: CreatePaymentIntentInfo,
    @CurrentUser() user: DeepPartial<UserEntity>
  ): Promise<unknown> {
    const propertyId = body.propertyId;
    delete body.propertyId;
    return (await this.createPaymentIntentAction.do(
      body,
      propertyId || '',
      user as UserEntity
    )) as unknown;
  }
}
