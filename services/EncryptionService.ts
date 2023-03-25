import { Service } from '../layers';
import { Circle } from '@circle-fin/circle-sdk';
import config from '../config/default';

@Service()
export default class EncryptionService {
  async getPublicKey() {
    const encryptionResponse = await this.circleGetEncryption();
    return encryptionResponse;
  }

  async circleGetEncryption() {
    try {
      const circle = new Circle(config.circleApiKey, config.circleBaseUrl);
      const result = await circle.encryption.getPublicKey();
      return result.data.data;
    } catch (error) {
      error.message = `Error getting encryption public key on circle: [${error?.response?.data?.code}]-${error?.response?.data?.message}`;
      throw error;
    }
  }
}
