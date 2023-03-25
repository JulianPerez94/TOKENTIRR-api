import { Action } from '../layers';
import EncryptionService from '../services/EncryptionService';

@Action()
export default class GetEncryptionPublicKeyAction {
  constructor(readonly encryptionService: EncryptionService) {}

  async get() {
    return await this.encryptionService.getPublicKey();
  }
}
