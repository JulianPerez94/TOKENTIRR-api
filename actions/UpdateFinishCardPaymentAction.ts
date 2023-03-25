import { Action } from '../layers';
import CardGroupTransactionService from '../services/CardGroupTransactionService';

@Action()
export default class UpdateFinishCardPaymentAction {
  constructor(
    readonly cardGroupTransactionService: CardGroupTransactionService
  ) {}

  async update(id: string, errorStatus?: string) {
    return errorStatus
      ? await this.cardGroupTransactionService.finishFailedCardPayment(id)
      : await this.cardGroupTransactionService.finishCardPayment(id);
  }
}
