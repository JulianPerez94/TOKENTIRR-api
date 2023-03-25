import { Action } from '../layers';
import TransactionService from '../services/TransactionService';

@Action()
export default class GetTransactionAction {
  constructor(readonly transactionService: TransactionService) {}

  async findOne(id: string) {
    return await this.transactionService.getTransactionByPaymentIntentId(id);
  }
}
