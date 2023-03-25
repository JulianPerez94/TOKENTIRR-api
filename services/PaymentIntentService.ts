import { v4 as uuidv4 } from 'uuid';
import { Service } from '../layers';
import PaymentRepo from '../repositories/PaymentRepo';
import { Circle, PaymentIntent } from '@circle-fin/circle-sdk';
import config from '../config/default';
import { CreatePaymentIntentInfo } from '../controllers/v1/CreatePaymentIntentController';
import PaymentEntity, { Status } from '../model/PaymentEntity';
import { FindOptionsWhere } from 'typeorm';
import CustomLogger from '../infrastructure/CustomLogger';
import UserEntity from '../model/UserEntity';
import PropertyRepo from '../repositories/PropertyRepo';
import TransactionRepo from '../repositories/TransactionRepo';
import ERC20Repo from '../repositories/ERC20Repo';

@Service()
export default class PaymentIntentService {
  constructor(
    readonly paymentRepo: PaymentRepo,
    readonly erc20Repo: ERC20Repo,
    readonly propertyRepo: PropertyRepo,
    readonly transactionRepo: TransactionRepo,
    readonly logger: CustomLogger
  ) {}

  async create(
    createPaymentIntentData: CreatePaymentIntentInfo,
    propertyId: string,
    user: UserEntity
  ) {
    createPaymentIntentData.idempotencyKey =
      createPaymentIntentData.idempotencyKey || uuidv4();
    const createPaymentIntentResponse = await this.circleCreatePaymentIntent(
      createPaymentIntentData
    );
    const property = (await this.propertyRepo.find({ id: propertyId }))[0];
    if (createPaymentIntentResponse && property) {
      const payment = createPaymentIntentResponse as unknown as PaymentEntity;
      payment.paymentIntentId = payment.id;
      payment.id = uuidv4();
      payment.idempotencyKey = createPaymentIntentData.idempotencyKey;
      payment.property = property;
      payment.status = Status.Started;
      payment.user = user;
      const result = await this.paymentRepo.save(payment);
      return result;
    }
    return createPaymentIntentResponse;
  }

  async updatePaymentIntent(paymentIntent: PaymentIntent) {
    try {
      const payment = await this.findByQuery({
        paymentIntentId: paymentIntent.id,
      });
      if (payment.length) {
        await this.updatePayment(payment[0].id, paymentIntent);
        const result = (
          await this.findByQuery({
            paymentIntentId: paymentIntent.id,
          })
        )[0];
        return result;
      } else {
        this.logger.info('We have not this payment in database', {
          paymentIntent,
        });
        throw new Error('We have not this payment in database');
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  async updatePayment(id: string, paymentIntent: PaymentIntent) {
    return await this.paymentRepo.updateOne(
      id,
      this._getUpdatesForPayment(paymentIntent)
    );
  }

  private _getUpdatesForPayment(paymentIntent: PaymentIntent) {
    return {
      paymentMethods: paymentIntent.paymentMethods,
      timeline: paymentIntent.timeline,
      expiresOn: paymentIntent.expiresOn,
      address: paymentIntent.paymentMethods[0].address,
      status: Status.Pending,
    };
  }

  async findById(id: string) {
    return (await this.paymentRepo.find({ id }))[0];
  }

  async findByQuery(query: FindOptionsWhere<PaymentEntity>) {
    return await this.paymentRepo.find(query);
  }

  async findExpiredOnes() {
    return await this.paymentRepo.findExpiredOnes();
  }

  async circleCreatePaymentIntent(
    createPaymentIntentData: CreatePaymentIntentInfo
  ) {
    try {
      const circle = new Circle(config.circleApiKey, config.circleBaseUrl);
      const result = await circle.paymentIntents.createPaymentIntent(
        createPaymentIntentData
      );

      return result.data.data;
    } catch (error) {
      error.message = `Error creating payment intent on circle: [${error?.response?.data?.code}]-${error?.response?.data?.message}`;
      throw error;
    }
  }
}
