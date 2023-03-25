import {
  Authorized,
  Body,
  CurrentUser,
  HttpCode,
  Post,
  Req,
} from 'routing-controllers';
import { Controller } from '../../layers';
import CreateCardPaymentAction from '../../actions/CreateCardPaymentAction';
import CardPaymentEntity from '../../model/CardPaymentEntity';
import { PaymentCreationRequest } from '@circle-fin/circle-sdk';
import UserEntity from '../../model/UserEntity';
import { Request } from 'koa';

@Controller('/api/v1')
export default class PaymentController {
  constructor(readonly createCardPaymentAction: CreateCardPaymentAction) {}
  @HttpCode(201)
  @Post('/card-payment')
  @Authorized()
  async create(
    @Body()
      body: PaymentCreationRequest & { propertyId?: string },
    @CurrentUser()
      user: UserEntity,
    @Req()
      request: Request
  ): Promise<CardPaymentEntity> {
    if (request.header.host) {
      return (await this.createCardPaymentAction.do(
        user,
        body,
        request.header.host.split(':')[0]
      )) as CardPaymentEntity;
    }

    throw new Error('IP not found');
  }
}
