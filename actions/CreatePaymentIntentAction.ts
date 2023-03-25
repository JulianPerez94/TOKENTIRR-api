import { CreatePaymentIntentInfo } from '../controllers/v1/CreatePaymentIntentController';
import { Action } from '../layers';
import UserEntity from '../model/UserEntity';
import PaymentIntentService from '../services/PaymentIntentService';

@Action()
export default class CreatePaymentIntentAction {
  constructor(readonly walletAddressService: PaymentIntentService) {}

  async do(
    createPaymentIntentData: CreatePaymentIntentInfo,
    propertyId: string,
    user: UserEntity
  ) {
    return await this.walletAddressService.create(
      createPaymentIntentData,
      propertyId,
      user
    );
  }
}
