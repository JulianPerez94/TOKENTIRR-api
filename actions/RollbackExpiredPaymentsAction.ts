import { Action } from '../layers';
import PaymentEntity from '../model/PaymentEntity';
import GroupTransactionService from '../services/GroupTransactionService';

@Action()
export default class RollbackExpiredPaymentsAction {
  constructor(readonly groupTransactionService: GroupTransactionService) {}

  async update(payment: PaymentEntity) {
    return await this.groupTransactionService.rollbackExpiredPayment(payment);
  }
}
