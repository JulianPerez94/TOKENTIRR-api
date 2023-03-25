import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';
import { Service } from '../layers';
import PaymentRepo from '../repositories/PaymentRepo';
import { PaymentIntent } from '@circle-fin/circle-sdk';
import config from '../config/default';
import PaymentEntity, { Status } from '../model/PaymentEntity';
import { EntityManager } from 'typeorm';
import CustomLogger from '../infrastructure/CustomLogger';
import TransactionEntity, {
  TransactionType,
} from '../model/TransactionsEntity';
import UserEntity from '../model/UserEntity';
import PropertyRepo from '../repositories/PropertyRepo';
import TransactionRepo from '../repositories/TransactionRepo';
import { getDatasource } from '../infrastructure/datasource';
import ERC20Entity from '../model/ERC20Entity';
import PropertyEntity from '../model/PropertyEntity';
import PaymentPaidService from './PaymentPaidService';
import PaidPayment from '../controllers/v1/payments';
import BalanceEntity from '../model/BalanceEntity';
import BalanceService from './BalanceService';
import CardPaymentRepo from '../repositories/CardPaymentRepo';
import PropertyService from './PropertyService';

@Service()
export default class GroupTransactionService {
  constructor(
    readonly paymentRepo: PaymentRepo,
    readonly propertyRepo: PropertyRepo,
    readonly cardPaymentRepo: CardPaymentRepo,
    readonly transactionRepo: TransactionRepo,
    readonly logger: CustomLogger,
    readonly paymentPaidService: PaymentPaidService,
    readonly balanceService: BalanceService,
    readonly propertyService: PropertyService
  ) {}

  async addTransactionUpdatingReserveOnERC20(
    payment: PaymentEntity,
    paymentIntent: PaymentIntent
  ) {
    const queryRunner = (
      await getDatasource().initialize()
    ).createQueryRunner();

    // establish real database connection using our new query runner
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      if (payment.property) {
        const tokens = await this.saveTransaction(
          queryRunner.manager,
          payment,
          paymentIntent
        );
        const property = await this.getProperty(
          queryRunner.manager,
          payment.property.id
        );
        await this.updateReserveSupply(
          queryRunner.manager,
          property[0],
          tokens
        );
        await queryRunner.commitTransaction();
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  async finishPayment(dbPayment: PaymentEntity, payment: PaidPayment) {
    const queryRunner = (
      await getDatasource().initialize()
    ).createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const updatedPayment = await this.updatePaidPayment(
        queryRunner.manager,
        dbPayment,
        payment
      );
      const { tokens, result } = await this.updateTransaction(
        queryRunner.manager,
        updatedPayment as PaymentEntity
      );

      const property = await this.getProperty(
        queryRunner.manager,
        dbPayment.property.id
      );
      const transactionAccount = await this.getTransactionFromProvider(
        updatedPayment
      );
      const { balance, hash } = await this.buyTokensOnErc20(
        queryRunner.manager,
        property[0],
        dbPayment.user as UserEntity,
        dbPayment.amount.currency,
        dbPayment.amount.amount,
        dbPayment.amount.amount,
        tokens,
        transactionAccount,
        updatedPayment?.id || ''
      );
      await queryRunner.commitTransaction();
      if (balance && hash) {
        await this._updateTokenizedTransfer(balance, property[0], hash, tokens);
      } else {
        this.logger.error('Cannot update to tokenized after transfer', {
          balance,
          hash,
          tokens,
        });
      }

      return result;
    } catch (err) {
      this.logger.error(
        'There is a paidPayment without process finished:' + err.message,
        {
          payment,
        }
      );
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async getTransactionFromProvider(
    updatedPayment: PaymentEntity | null
  ) {
    const provider = new ethers.providers.JsonRpcProvider(
      config.polygonProvider
    );
    const txReceipt = await provider.getTransactionReceipt(
      updatedPayment?.hash || ''
    );
    return txReceipt.from;
  }

  async buyTokensOnErc20(
    queryRunner: EntityManager,
    property: PropertyEntity,
    user: UserEntity,
    type: string,
    investment: string,
    dolars: string,
    tokens: number,
    account: string,
    paymentId: string
  ) {
    if (property && property.erc20) {
      const result = (await this.saveBalance(
        queryRunner,
        user,
        property.erc20,
        type,
        account,
        investment,
        dolars,
        tokens,
        paymentId
      )) as BalanceEntity;
      if (result.account && result.erc20) {
        return await this.buyOnErc20(result);
      }
    }
    return {} as { balance: BalanceEntity; hash: string };
  }

  async saveBalance(
    queryRunner: EntityManager,
    user: UserEntity,
    erc20: ERC20Entity,
    type: string,
    account: string,
    investment: string,
    dolars: string,
    tokens: number,
    paymentId: string
  ) {
    const balance = {
      id: uuidv4(),
      account,
      tokens: tokens.toString(),
      type,
      investment: investment.toString(),
      dolars: dolars.toString(),
      user,
      erc20,
      paymentId,
    } as BalanceEntity;
    const result = await queryRunner.save(BalanceEntity, balance);
    this.logger.info('Balance for erc20 pending', { balance: result });
    return result;
  }

  async buyOnErc20(balance: BalanceEntity) {
    try {
      const ew = await BalanceService.connectToEthersWrapper(
        balance?.erc20?.contractAddress || ''
      );
      const result = await ew.transfer(balance.account || '', balance.tokens);

      if (balance.erc20) {
        this.logger.info(
          `Balance for contract ${balance.erc20.contractAddress} of ${balance.tokens} to account ${balance.account} executed with hash ${result.hash}`
        );
        await result.wait();
      }
      return { balance, hash: result.hash };
    } catch (error) {
      this.logger.error(`Error buying tokens: ${error.message}`, {
        stack: error.stack,
      });
      throw error;
    }
  }
  private async _updateTokenizedTransfer(
    balance: BalanceEntity,
    property: PropertyEntity,
    hash: string,
    tokens: number
  ) {
    const queryRunner = (
      await getDatasource().initialize()
    ).createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      await this.updateHashOnBalance(queryRunner.manager, balance, hash);

      await this._confirmBalance(queryRunner.manager, balance.id, hash);

      await this._updatePropertyTokens(
        queryRunner.manager,
        property,
        balance.tokens
      );

      await this.updateCurrentSupply(queryRunner.manager, property, tokens);

      await this.updateTransactionByPaymentId(
        queryRunner.manager,
        balance.paymentId,
        {
          paymentStatus: Status.Tokenized,
        }
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      this.logger.error('There is a tokenize transfer error:' + err.message, {
        balance,
        property,
        hash,
        tokens,
        stack: err.stack,
      });
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  private async _updatePropertyTokens(
    queryRunner: EntityManager,
    property: PropertyEntity,
    tokens: string
  ) {
    const updateTokens = property.availableTokens - parseInt(tokens);
    await queryRunner.update(
      PropertyEntity,
      { id: property.id },
      {
        availableTokens: updateTokens,
      }
    );
  }

  private async updateHashOnBalance(
    queryRunner: EntityManager,
    balance: BalanceEntity,
    hash: string
  ) {
    try {
      await queryRunner.update(
        BalanceEntity,
        { id: balance.id },
        {
          hash,
        }
      );
    } catch (error) {
      this.logger.error('Error updating hash on balance', {
        balance,
        hash,
      });
      throw error;
    }
  }

  private async _confirmBalance(
    queryRunner: EntityManager,
    id: string,
    hash: string
  ) {
    await queryRunner.update(BalanceEntity, { id }, { confirmed: true, hash });
    this.logger.info(`Balance with has ${hash} confirmed`);
  }
  async findAccountBalances(
    queryRunner: EntityManager,
    account: string,
    erc20Id: string
  ) {
    return await queryRunner.find(BalanceEntity, {
      where: {
        account: account,
        erc20: {
          id: erc20Id,
        },
      },
    });
  }
  async updatePayment(
    queryRunner: EntityManager,
    id: string,
    data: Partial<PaymentEntity>
  ) {
    await queryRunner.update(PaymentEntity, { id }, data);
  }
  async updatePaidPayment(
    queryRunner: EntityManager,
    paymentIntent: PaymentEntity,
    paidPayment: PaidPayment
  ) {
    await queryRunner.update(
      PaymentEntity,
      { id: paymentIntent.id },
      this.paymentPaidService.getUpdatesForPaidPayment(
        paymentIntent,
        paidPayment
      )
    );
    return queryRunner.findOne(PaymentEntity, {
      where: { id: paymentIntent.id },
      relations: ['user', 'property'],
    });
  }
  async updateTransactionByPaymentId(
    queryRunner: EntityManager,
    paymentId: string,
    data: Partial<TransactionEntity>
  ) {
    await queryRunner.update(
      TransactionEntity,
      { payment: { id: paymentId } },
      data
    );
  }
  async updateTransaction(queryRunner: EntityManager, payment: PaymentEntity) {
    const transaction = (
      await queryRunner.find(TransactionEntity, {
        where: {
          payment: {
            paymentIntentId: payment.paymentIntentId,
          },
        },
        relations: ['property', 'payment'],
      })
    )[0];
    const tokens = parseInt(
      String(
        (parseFloat(payment.amount.amount) * 1000) / payment.property.tokenPrice
      )
    );
    await queryRunner.update(
      TransactionEntity,
      { id: transaction.id },
      {
        tokens,
        amount: parseInt(payment.amount.amount),
        paymentStatus: Status.Paid,
        hash: payment.hash,
      }
    );

    const result = await queryRunner.find(TransactionEntity, {
      where: { id: transaction.id },
      relations: ['property', 'payment'],
    });

    return { tokens, result: result && result[0] };
  }

  async rollbackExpiredPayment(payment: PaymentEntity) {
    const queryRunner = (
      await getDatasource().initialize()
    ).createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      if (payment.property) {
        const tokens = parseInt(
          String(
            (parseFloat(payment.amount.amount) * 1000) /
              payment.property.tokenPrice
          )
        );
        const property = await this.getProperty(
          queryRunner.manager,
          payment.property.id
        );
        await this.updatePayment(queryRunner.manager, payment.id, {
          status: Status.Expired,
        });
        await this.updateTransactionByPaymentId(
          queryRunner.manager,
          payment.id,
          {
            paymentStatus: Status.Expired,
          }
        );
        await this.updateReserveSupply(
          queryRunner.manager,
          property[0],
          -tokens
        );
        await queryRunner.commitTransaction();
      }
    } catch (err) {
      this.logger.error(
        'rollbackExpiredPayment process failed:' + err.message,
        {
          payment,
        }
      );
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateReserveSupply(
    queryRunner: EntityManager,
    property: PropertyEntity,
    tokens: number
  ) {
    if (!property.erc20)
      throw new Error(`No erc20 on property: ${property.id}`);
    const reserve = property.erc20?.reserveSupply - tokens;
    return await queryRunner.update(
      ERC20Entity,
      { property: property },
      {
        reserveSupply: reserve,
      }
    );
  }

  async updateCurrentSupply(
    queryRunner: EntityManager,
    property: PropertyEntity,
    tokens: number
  ) {
    const currentSupply =
      property.erc20 && property.erc20?.currentSupply - tokens;
    return await queryRunner.update(
      ERC20Entity,
      { property: property },
      {
        currentSupply,
      }
    );
  }

  async getProperty(queryRunner: EntityManager, id: string) {
    return await queryRunner.find(PropertyEntity, {
      where: { id },
      relations: ['erc20'],
    });
  }

  async saveTransaction(
    queryRunner: EntityManager,
    payment: PaymentEntity,
    paymentIntent: PaymentIntent
  ) {
    const tokens = parseInt(
      String(
        (parseFloat(paymentIntent.amount.amount) * 1000) /
          payment.property.tokenPrice
      )
    );
    const transaction = this._getTransactionFrom(payment, tokens);

    await queryRunner.save(TransactionEntity, transaction);
    return tokens;
  }
  private _getTransactionFrom(payment: PaymentEntity, tokens: number) {
    return {
      id: uuidv4(),
      property: payment.property,
      payment: payment,
      user: payment.user,
      tokens,
      amount: parseInt(payment.amount.amount), // TODO no es parse int
      amountType: payment.amount.currency,
      paymentStatus: Status.Pending,
      type: TransactionType.Buy,
    };
  }
}
