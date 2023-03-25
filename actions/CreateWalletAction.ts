import { CreateWalletInfo } from '../controllers/v1/CreateWalletController';
import { Action } from '../layers';
import CreateWalletService from '../services/WalletService';

@Action()
export default class CreateWalletAction {
  constructor(readonly cardPaymentService: CreateWalletService) {}

  async do(createWalletData: CreateWalletInfo) {
    return await this.cardPaymentService.create(createWalletData);
  }
}
