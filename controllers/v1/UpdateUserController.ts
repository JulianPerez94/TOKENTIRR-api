import {
  Authorized,
  Body,
  CurrentUser,
  HttpCode,
  Put,
} from 'routing-controllers';
import { Controller } from '../../layers';
import UpdateUserAction from '../../actions/UpdateUserAction';
import UserEntity from '../../model/UserEntity';

export type UpdateUserInfo = {
  description: string;
  propertyId: string;
};

@Controller('/api/v1')
export default class UpdateUserController {
  constructor(readonly updateUserAction: UpdateUserAction) {}
  @HttpCode(200)
  @Put('/user')
  @Authorized()
  async create(
    @Body()
      body: Partial<UserEntity>,
    @CurrentUser()
      user: UserEntity
  ): Promise<UserEntity> {
    return (await this.updateUserAction.do(
      user.id,
      body
    )) as unknown as UserEntity;
  }
}
