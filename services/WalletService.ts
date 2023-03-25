import { v4 as uuidv4 } from 'uuid';
import { Service } from '../layers';
import WalletRepo from '../repositories/WalletRepo';
import { Circle } from '@circle-fin/circle-sdk';
import config from '../config/default';
import { CreateWalletInfo } from '../controllers/v1/CreateWalletController';

@Service()
export default class CreateWalletService {
  constructor(readonly walletRepo: WalletRepo) {}

  async create(createWalletData: CreateWalletInfo) {
    const walletCreationRequest = {
      idempotencyKey: uuidv4(),
      description: createWalletData.description,
    };

    try {
      const circle = new Circle(config.circleApiKey, config.circleBaseUrl);
      const createWalletResponse = await circle.wallets.createWallet(
        walletCreationRequest
      );

      const createWallet = {
        id: uuidv4(),
        ...createWalletResponse.data.data,
        propertyId: createWalletData.propertyId,
      };

      return await this.walletRepo.save(createWallet);
    } catch (error) {
      error.message = `Error creating wallet on circle: [${error?.response?.data?.code}]-${error?.response?.data?.message}`;
      throw error;
    }
  }

  async findById(id: string) {
    return (await this.walletRepo.find({ id }))[0];
  }
}
