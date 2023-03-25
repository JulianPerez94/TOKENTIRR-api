import { Service } from '../layers';
import UserEntity from '../model/UserEntity';
import UserRepo from '../repositories/UserRepo';

@Service()
export default class UserService {
  constructor(readonly userRepo: UserRepo) {}

  async findByEmail(email: string) {
    return await this.userRepo.findOne({ email });
  }

  async update(id: string, user: Partial<UserEntity>) {
    return await this.userRepo.updateOne(id, user);
  }
}
