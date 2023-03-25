import { v4 as uuidv4 } from 'uuid';
import { Service } from '../layers';
import WalletRepo from '../repositories/WalletRepo';
import { Circle } from '@circle-fin/circle-sdk';
import config from '../config/default';
import { CreateTransferInfo } from '../controllers/v1/CreateTransferController';

@Service()
export default class TransferService {
  constructor(readonly walletRepo: WalletRepo) {}

  async create(createTransferData: CreateTransferInfo) {
    createTransferData.idempotencyKey =
      createTransferData.idempotencyKey || uuidv4();
    try {
      const circle = new Circle(config.circleApiKey, config.circleBaseUrl);
      const createTransferResponse = await circle.transfers.createTransfer(
        createTransferData
      );

      return createTransferResponse.data.data;
    } catch (error) {
      error.message = `Error creating transfer on circle: [${error?.response?.data?.code}]-${error?.response?.data?.message}`;
      throw error;
    }
  }

  async findById(id: string) {
    return (await this.walletRepo.find({ id }))[0];
  }
}
