import { v4 as uuidv4 } from 'uuid';
import { Service } from '../layers';
import WalletRepo from '../repositories/WalletRepo';
import { Circle } from '@circle-fin/circle-sdk';
import config from '../config/default';
import { CreateWalletAddressInfo } from '../controllers/v1/CreateWalletAddressController';

@Service()
export default class CreateWalletAddressService {
  constructor(readonly walletRepo: WalletRepo) {}

  async create(createWalletAddressData: CreateWalletAddressInfo) {
    const walletAddressCreationRequest = {
      idempotencyKey: uuidv4(),
      currency: createWalletAddressData.currency,
      chain: createWalletAddressData.chain,
    };

    try {
      const circle = new Circle(config.circleApiKey, config.circleBaseUrl);
      const createWalletAddressResponse = await circle.wallets.generateAddress(
        createWalletAddressData.walletId,
        walletAddressCreationRequest
      );

      return createWalletAddressResponse.data.data;
    } catch (error) {
      error.message = `Error generating address on circle: [${error?.response?.data?.code}]-${error?.response?.data?.message}`;
      throw error;
    }
  }

  async findById(id: string) {
    return (await this.walletRepo.find({ id }))[0];
  }
}
