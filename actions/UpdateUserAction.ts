import { Action } from '../layers';
import UserEntity from '../model/UserEntity';
import UserService from '../services/UserService';

@Action()
export default class UpdateUserAction {
  constructor(readonly userService: UserService) {}

  async do(id: string, user: Partial<UserEntity>) {
    if (user.wallet) {
      return await this.userService.update(id, { wallet: user.wallet });
    }
  }
}
