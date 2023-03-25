import { HttpError } from 'routing-controllers';
import { UserBody } from '../controllers/v1/AuthorizationController';
import { Action } from '../layers';
import RegisterService from '../services/RegisterService';
import UserService from '../services/UserService';

@Action()
export default class RegisterAction {
  constructor(
    readonly registerService: RegisterService,
    readonly userService: UserService
  ) {}

  async do({ email, password }: UserBody) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return await this.registerService.register(email, password);
    } else {
      throw new HttpError(409, 'User exist');
    }
  }
}
