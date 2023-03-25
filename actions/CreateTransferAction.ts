import { CreateTransferInfo } from '../controllers/v1/CreateTransferController';
import { Action } from '../layers';
import TransferService from '../services/TransferService';

@Action()
export default class CreateTransferAction {
  constructor(readonly walletAddressService: TransferService) {}

  async do(createTransferData: CreateTransferInfo) {
    return await this.walletAddressService.create(createTransferData);
  }
}
