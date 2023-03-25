import { Action } from '../layers';
import CardGroupTransactionService from '../services/CardGroupTransactionService';
import { PaymentCreationRequest } from '@circle-fin/circle-sdk';
import UserEntity from '../model/UserEntity';

@Action()
export default class CreateCardPaymentAction {
  constructor(
    readonly cardGroupTransactionService: CardGroupTransactionService
  ) {}

  async do(
    user: UserEntity,
    cardPayment: PaymentCreationRequest,
    host: string
  ) {
    return await this.cardGroupTransactionService.createCardPayment(
      user,
      cardPayment,
      host
    );
  }
}
