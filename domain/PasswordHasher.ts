import { scrypt } from 'crypto';
import { promisify } from 'util';
import config from '../config/default';

const asyncScrypt = promisify(scrypt);

export default class PasswordHasher {
  static async toHash(pass: string) {
    const buffer = (await asyncScrypt(pass, config.salt, 64)) as Buffer;

    return buffer.toString('hex');
  }

  static async exactMatch(hashedPass: string, providedPass: string) {
    const buffer = (await asyncScrypt(providedPass, config.salt, 64)) as Buffer;

    return buffer.toString('hex') === hashedPass;
  }
}
