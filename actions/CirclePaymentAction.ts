import { Action } from '../layers';
import PaymentIntentService from '../services/PaymentIntentService';
import PaidPayment from '../controllers/v1/payments';
import CustomLogger from '../infrastructure/CustomLogger';
import GroupTransactionService from '../services/GroupTransactionService';

@Action()
export default class CirclePaymentAction {
  constructor(
    readonly paymentIntentService: PaymentIntentService,
    readonly groupTransactionService: GroupTransactionService,
    readonly logger: CustomLogger
  ) {}

  async execute(payment: PaidPayment) {
    const dbPayment = (
      await this.paymentIntentService.findByQuery({
        paymentIntentId: payment.paymentIntentId,
      })
    )[0];
    if (dbPayment) {
      await this.groupTransactionService.finishPayment(dbPayment, payment);
    } else {
      this.logger.warn('No payment asociated to this paid payment', {
        paidPayment: payment,
      });
    }
  }
}
