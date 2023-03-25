import { CreateWalletAddressInfo } from '../controllers/v1/CreateWalletAddressController';
import { Action } from '../layers';
import CreateWalletAddressService from '../services/WalletAddressService';

@Action()
export default class CreateWalletAddressAction {
  constructor(readonly walletAddressService: CreateWalletAddressService) {}

  async do(createWalletAddressData: CreateWalletAddressInfo) {
    return await this.walletAddressService.create(createWalletAddressData);
  }
}
