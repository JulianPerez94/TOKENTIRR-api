import { Service } from '../layers';
import CardPaymentRepo from '../repositories/CardPaymentRepo';
import { Circle, FiatPayment } from '@circle-fin/circle-sdk';
import config from '../config/default';
import CustomLogger from '../infrastructure/CustomLogger';
import GroupTransactionService from './GroupTransactionService';
import PropertyService from './PropertyService';
import TransactionRepo from '../repositories/TransactionRepo';

@Service()
export default class CardPaymentService {
  constructor(
    readonly cardPaymentRepo: CardPaymentRepo,
    readonly logger: CustomLogger,
    readonly groupTransactionService: GroupTransactionService,
    readonly propertyService: PropertyService,
    readonly transactionRepo: TransactionRepo
  ) {}

  async findById(id: string) {
    return (await this.cardPaymentRepo.find({ id }))[0];
  }

  async findCardNotPaidConfiremedPayments() {
    return await this.cardPaymentRepo.find({ confirmed: false });
  }

  async circleGetCardPayment(id: string): Promise<FiatPayment> {
    try {
      const circle = new Circle(config.circleApiKey, config.circleBaseUrl);
      const result = await circle.payments.getPayment(id);
      return result.data.data as unknown as FiatPayment;
    } catch (error) {
      error.message = `Error getting card payment on circle: [${error?.response?.data?.code}]-${error?.response?.data?.message}`;
      throw error;
    }
  }
}
