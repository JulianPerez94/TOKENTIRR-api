import { Action } from '../layers';
import PaymentIntentService from '../services/PaymentIntentService';
import PaidPayment from '../controllers/v1/payments';
import CustomLogger from '../infrastructure/CustomLogger';
import TransactionService from '../services/TransactionService';

@Action()
export default class CircleTransactionProcessAction {
  constructor(
    readonly paymentIntentService: PaymentIntentService,
    readonly transactionService: TransactionService,
    readonly logger: CustomLogger
  ) {}

  async execute(payment: PaidPayment) {
    const dbPayment = (
      await this.paymentIntentService.findByQuery({
        paymentIntentId: payment.paymentIntentId,
      })
    )[0];
    if (dbPayment) {
      await this.transactionService.setPaymentTransactionStatus(dbPayment);
    } else {
      this.logger.warn('No payment asociated to this paid payment', {
        paidPayment: payment,
      });
    }
  }
}
