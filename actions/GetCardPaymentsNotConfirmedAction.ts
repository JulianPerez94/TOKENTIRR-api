import { Action } from '../layers';
import CardPaymentService from '../services/CardPaymentService';

@Action()
export default class GetCardPaymentsNotConfirmedAction {
  constructor(readonly cardPaymentService: CardPaymentService) {}

  async get() {
    return await this.cardPaymentService.findCardNotPaidConfiremedPayments();
  }
}
