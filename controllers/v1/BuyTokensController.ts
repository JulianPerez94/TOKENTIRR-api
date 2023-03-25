import {
  Authorized,
  Body,
  CurrentUser,
  HttpCode,
  Post,
} from 'routing-controllers';
import { Controller } from '../../layers';
import BuyTokensAction from '../../actions/BuyTokensAction';
import { DeepPartial } from 'typeorm';
import UserEntity from '../../model/UserEntity';
import BalanceEntity from '../../model/BalanceEntity';
import { OpenAPI } from 'routing-controllers-openapi';
import schemas from '../schemas';

@Controller('/api/v1')
export default class BuyTokensController {
  constructor(readonly buyTokensAction: BuyTokensAction) {}
  @OpenAPI({
    summary: 'Buy ERC20 property tokens',
    security: [
      {
        bearerAuth: [],
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: schemas.BuyTokensBody,
        },
      },
    },
    responses: {
      201: {
        description: 'Balance for buyed tokens',
        content: {
          'application/json': {
            schema: schemas.Balance,
          },
        },
      },
      401: {
        description: 'Authorization Rejected',
      },
    },
  })
  @HttpCode(201)
  @Post('/tokens')
  @Authorized()
  async buy(
    @Body()
      body: {
      propertyId: string;
      type: string;
      account: string;
      investment: number;
      dolars: number;
    },
    @CurrentUser() user: DeepPartial<UserEntity>
  ): Promise<BalanceEntity> {
    return (await this.buyTokensAction.buy(
      body.propertyId,
      body.type,
      body.account,
      body.investment,
      body.dolars,
      user as UserEntity
    )) as BalanceEntity;
  }
}
