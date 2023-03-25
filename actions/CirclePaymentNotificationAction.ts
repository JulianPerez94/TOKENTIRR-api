import { PaymentIntent } from '@circle-fin/circle-sdk';
import { Action } from '../layers';
import PaymentIntentService from '../services/PaymentIntentService';
import TransactionService from '../services/TransactionService';

@Action()
export default class CirclePaymentNotificationAction {
  constructor(
    readonly paymentIntentService: PaymentIntentService,
    readonly transactionService: TransactionService
  ) {}

  async addTransaction(paymentIntent: PaymentIntent) {
    const updatedPaymentIntent =
      await this.paymentIntentService.updatePaymentIntent(paymentIntent);
    await this.transactionService.addTransaction(
      updatedPaymentIntent,
      paymentIntent
    );
  }
}
