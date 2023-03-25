import { decode } from 'jsonwebtoken';
import { Action } from '../layers';
import UserRepo from '../repositories/UserRepo';
import AuthorizationService from '../services/AuthorizationService';

@Action()
export default class AuthorizedAction {
  readonly authService: AuthorizationService;
  constructor() {
    this.authService = new AuthorizationService(new UserRepo());
  }
  async authorize(token: string) {
    const { id, expiration } = decode(token) as {
      id: string;
      expiration: number;
    };
    await this.authService.checkExpirationTime(expiration);
    await this.authService.findOrFailUser(id);
  }
}
