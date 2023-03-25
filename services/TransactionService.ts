import { Service } from '../layers';
import PaymentRepo from '../repositories/PaymentRepo';
import { PaymentIntent } from '@circle-fin/circle-sdk';
import PaymentEntity, { Status } from '../model/PaymentEntity';
import TransactionsEntity from '../model/TransactionsEntity';
import CustomLogger from '../infrastructure/CustomLogger';
import PropertyRepo from '../repositories/PropertyRepo';
import TransactionRepo from '../repositories/TransactionRepo';
import GroupTransactionService from './GroupTransactionService';

@Service()
export default class TransactionService {
  constructor(
    readonly paymentRepo: PaymentRepo,
    readonly propertyRepo: PropertyRepo,
    readonly transactionRepo: TransactionRepo,
    readonly logger: CustomLogger,
    readonly groupTransactionService: GroupTransactionService
  ) {}
  async setPaymentTransactionStatus(dbPayment: PaymentEntity) {
    const transation = (
      await this.transactionRepo.find({
        payment: {
          paymentIntentId: dbPayment.paymentIntentId,
        },
      })
    )[0];
    return this.transactionRepo.updateOne(transation.id, {
      paymentStatus: Status.Process,
    });
  }
  async addTransaction(payment: PaymentEntity, paymentIntent: PaymentIntent) {
    if (payment) {
      await this.groupTransactionService.addTransactionUpdatingReserveOnERC20(
        payment,
        paymentIntent
      );
    } else {
      this.logger.error(
        'transaction cannot be stored, payment does not exist',
        { payment, paymentIntent }
      );
    }
  }

  async getTransactionByPaymentIntentId(id: string) {
    return (
      await this.transactionRepo.find({
        payment: {
          paymentIntentId: id,
        },
      })
    )[0];
  }

  async getTransactionByUserId(id: string) {
    const transactions = await this.transactionRepo.find({
      user: {
        id,
      },
    });
    return this.normalizePaymentsTransaction(transactions);
  }

  private normalizePaymentsTransaction(transactions: TransactionsEntity[]) {
    return transactions.map((i) => {
      if (i.payment) return i;
      i.payment = {} as PaymentEntity;
      i.payment.createDate = i.cardPayment?.createdAt.toISOString() || '';
      i.payment.status = i.cardPayment?.confirmed
        ? Status.Paid
        : Status.Process;
      i.payment.address = '';
      return i;
    });
  }
}
