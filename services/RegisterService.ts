import { v4 as uuidv4 } from 'uuid';
import PasswordHasher from '../domain/PasswordHasher';
import { Service } from '../layers';
import UserRepo from '../repositories/UserRepo';

@Service()
export default class RegisterService {
  constructor(readonly userRepo: UserRepo) {}

  async register(email: string, password: string) {
    const hashedPassword = await PasswordHasher.toHash(password);
    return await this.userRepo.save({
      id: uuidv4(),
      email,
      password: hashedPassword,
    });
  }
}
