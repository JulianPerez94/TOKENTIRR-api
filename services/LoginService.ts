import PasswordHasher from '../domain/PasswordHasher';
import { Service } from '../layers';
import UserRepo from '../repositories/UserRepo';
import JWTGenerator from '../domain/JWTGenerator';

@Service()
export default class LoginService {
  constructor(readonly userRepo: UserRepo) {}

  async login(email: string, password: string) {
    const hashedPassword = await PasswordHasher.toHash(password);
    const user = await this.userRepo.findOne({
      email,
      password: hashedPassword,
    });
    if (user) {
      const jwt = JWTGenerator.sign(user);
      return { accessToken: jwt };
    }
    throw new Error('User not found');
  }
}
