import { Action } from '../layers';
import PaymentsService from '../services/PaymentIntentService';

@Action()
export default class GetExpiredPaymentsAction {
  constructor(readonly paymentsService: PaymentsService) {}

  async get() {
    return await this.paymentsService.findExpiredOnes();
  }
}
