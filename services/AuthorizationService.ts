import { Service } from '../layers';
import UserRepo from '../repositories/UserRepo';

@Service()
export default class AuthorizationService {
  constructor(readonly userRepo: UserRepo) {}
  async checkExpirationTime(expiration: number) {
    if (new Date(expiration).getTime() > 0) {
      if (expiration < Date.now()) {
        throw new Error('Token expirated');
      }
    } else {
      throw new Error('Login required');
    }
  }

  async findOrFailUser(id: string) {
    await new UserRepo().findOneOrFail({ id });
  }
}
