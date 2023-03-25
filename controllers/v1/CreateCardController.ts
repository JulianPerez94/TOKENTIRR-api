import { Authorized, Body, HttpCode, Post, Req } from 'routing-controllers';
import { Controller } from '../../layers';
import CreateCardAction from '../../actions/CreateCardAction';
import CardEntity from '../../model/CardEntity';
import { CardCreationRequest } from '@circle-fin/circle-sdk';
import { Request } from 'koa';

@Controller('/api/v1')
export default class PaymentController {
  constructor(readonly createCardAction: CreateCardAction) {}
  @HttpCode(201)
  @Post('/card')
  @Authorized()
  async create(
    @Body()
      body: CardCreationRequest,
    @Req()
      request: Request
  ): Promise<CardEntity> {
    if (request.header.host) {
      return (await this.createCardAction.do(
        body,
        request.header.host.split(':')[0]
      )) as CardEntity;
    }

    throw new Error('IP not found');
  }
}
