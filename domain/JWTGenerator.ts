import config from '../config/default';
import { sign } from 'jsonwebtoken';
import UserEntity from '../model/UserEntity';

export default class JWTGenerator {
  static generate(user: UserEntity) {
    return {
      email: user.email,
      id: user.id,
      expiration: Date.now() + parseInt(config.tokenExpiration),
    };
  }
  static sign(user: UserEntity) {
    return sign(JSON.stringify(JWTGenerator.generate(user)), config.authSecret);
  }
}
