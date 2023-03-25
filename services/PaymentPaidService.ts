import { Service } from '../layers';
import PaymentRepo from '../repositories/PaymentRepo';
import PaymentEntity, { Amount, Status } from '../model/PaymentEntity';
import CustomLogger from '../infrastructure/CustomLogger';
import PaidPayment from '../controllers/v1/payments';

@Service()
export default class PaymentPaidService {
  constructor(
    readonly paymentRepo: PaymentRepo,
    readonly logger: CustomLogger
  ) {}

  async updatePaidPayment(
    paymentIntent: PaymentEntity,
    paidPayment: PaidPayment
  ) {
    return await this.paymentRepo.updateOne(
      paymentIntent.id,
      this.getUpdatesForPaidPayment(paymentIntent, paidPayment)
    );
  }

  public getUpdatesForPaidPayment(
    paymentIntent: PaymentEntity,
    paidPayment: PaidPayment
  ) {
    if (paidPayment.amount.currency !== paymentIntent.settlementCurrency) {
      this.logger.warn(
        'Paid currency and settlement currency are not the same',
        {
          paidPayment,
        }
      );
      throw new Error('Paid currency and settlement currency are not the same');
    }

    return {
      hash: paidPayment.transactionHash,
      depositAddress: paidPayment.depositAddress.address,
      status: Status.Paid,
      merchantWalletId: paidPayment.merchantWalletId,
      merchantId: paidPayment.merchantId,
      amount: paidPayment.amount as Amount,
    };
  }
}
