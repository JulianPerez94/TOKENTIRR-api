import {
  Authorized,
  Body,
  CurrentUser,
  Get,
  HttpCode,
  Post,
  UnauthorizedError,
} from 'routing-controllers';
import { Controller } from '../../layers';
import DeployERC20Action from '../../actions/DeployERC20Action';
import FindAllERC20Action from '../../actions/FindAllERC20Action';
import { DeepPartial } from 'typeorm';
import UserEntity from '../../model/UserEntity';
import config from '../../config/default';
import ERC20 from '../../domain/entities/ERC20Deploy';
import ERC20Entity from '../../model/ERC20Entity';
import schemas from '../schemas';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller('/api/v1')
export default class DeployContractController {
  constructor(
    readonly deployERC20Action: DeployERC20Action,
    readonly findAllERC20Action: FindAllERC20Action
  ) {}
  @OpenAPI({
    summary: 'Deploy an smart contract',
    security: [
      {
        bearerAuth: [],
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: schemas.DeployERC20Body,
        },
      },
    },
    responses: {
      201: {
        description: 'Erc 20 to deploy',
        content: {
          'application/json': {
            schema: schemas.ERC20,
          },
        },
      },
      401: {
        description: 'Authorization Rejected',
      },
    },
  })
  @HttpCode(201)
  @Post('/erc20')
  @Authorized()
  async create(
    @Body()
      body: { propertyId: string; bankAccount: string },
    @CurrentUser() user: DeepPartial<UserEntity>
  ): Promise<ERC20> {
    if (!config.validatedEmails.split(',').includes(user.email || ''))
      throw new UnauthorizedError('You are not authorized to deploy contracts');
    return (await this.deployERC20Action.deploy(
      body.propertyId,
      body.bankAccount,
      user as UserEntity
    )) as ERC20;
  }
  @OpenAPI({
    summary: 'Retrieve ERC20',
    security: [
      {
        bearerAuth: [],
      },
    ],
    responses: {
      200: {
        description: 'Erc 20 result',
        content: {
          'application/json': {
            schema: schemas.ERC20,
          },
        },
      },
      401: {
        description: 'Authorization Rejected',
      },
    },
  })
  @HttpCode(200)
  @Get('/erc20')
  @Authorized()
  async findAll(
    @CurrentUser() user: DeepPartial<UserEntity>
  ): Promise<ERC20Entity[]> {
    if (!config.validatedEmails.split(',').includes(user.email || ''))
      throw new UnauthorizedError(
        'You are not authorized to retrieve deployed contracts'
      );
    return await this.findAllERC20Action.find();
  }
}
