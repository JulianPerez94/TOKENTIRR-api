import { UserBody } from '../controllers/v1/AuthorizationController';
import { Action } from '../layers';
import LoginService from '../services/LoginService';

@Action()
export default class LoginAction {
  constructor(readonly loginService: LoginService) {}

  async do({ email, password }: UserBody) {
    return await this.loginService.login(email, password);
  }
}
