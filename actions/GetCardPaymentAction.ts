import { Action } from '../layers';
import CardPaymentService from '../services/CardPaymentService';

@Action()
export default class GetCardPaymentAction {
  constructor(readonly cardPaymentService: CardPaymentService) {}

  async get(id: string) {
    return await this.cardPaymentService.circleGetCardPayment(id);
  }
}
