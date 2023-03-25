import { Action } from '../layers';
import UserEntity from '../model/UserEntity';
import TransactionService from '../services/TransactionService';

@Action()
export default class GetTransactionsByUserAction {
  constructor(readonly transactionService: TransactionService) {}

  async findAll(user: UserEntity) {
    return await this.transactionService.getTransactionByUserId(user.id);
  }
}
