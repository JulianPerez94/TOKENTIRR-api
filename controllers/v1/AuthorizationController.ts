import { Body, HttpCode, Post } from 'routing-controllers';
import { Controller } from '../../layers';
import RegisterAction from '../../actions/RegisterAction';
import LoginAction from '../../actions/LoginAction';
import UserEntity from '../../model/UserEntity';
import { OpenAPI } from 'routing-controllers-openapi';
import schemas from '../schemas';
export type UserBody = {
  email: string;
  password: string;
};
@Controller('/api/v1')
export default class AuthorizationController {
  constructor(
    readonly registerAction: RegisterAction,
    readonly loginAction: LoginAction
  ) {}
  @OpenAPI({
    summary: 'Register in tokentirr',
    requestBody: {
      content: {
        'application/json': {
          schema: schemas.RegisterBody,
        },
      },
    },
    responses: {
      201: {
        description: 'Registered user',
        content: {
          'application/json': {
            schema: schemas.User,
          },
        },
      },
    },
  })
  @HttpCode(201)
  @Post('/register')
  async register(
    @Body()
      body: UserBody
  ): Promise<Partial<UserEntity>> {
    const result = (await this.registerAction.do(body)) as UserEntity;
    const response = {
      id: result.id,
      email: result.email,
    };
    return response;
  }
  @OpenAPI({
    summary: 'Login in tokentirr',
    requestBody: {
      content: {
        'application/json': {
          schema: schemas.RegisterBody,
        },
      },
    },
    responses: {
      200: {
        description: 'Registered user',
        content: {
          'application/json': {
            schema: schemas.Token,
          },
        },
      },
    },
  })
  @HttpCode(200)
  @Post('/login')
  async login(
    @Body()
      body: UserBody
  ): Promise<{ accessToken: string }> {
    return await this.loginAction.do(body);
  }
}
