import { v4 as uuidv4 } from 'uuid';
import { Service } from '../layers';
import PaymentRepo from '../repositories/PaymentRepo';
import { Circle, PaymentCreationRequest } from '@circle-fin/circle-sdk';
import config from '../config/default';
import { Status } from '../model/PaymentEntity';
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
import BalanceEntity from '../model/BalanceEntity';
import BalanceService from './BalanceService';
import CardPaymentEntity from '../model/CardPaymentEntity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import CardPaymentRepo from '../repositories/CardPaymentRepo';
import PropertyService from './PropertyService';

@Service()
export default class CardGroupTransactionService {
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

  async createCardPayment(
    user: UserEntity,
    cardPayment: PaymentCreationRequest & { propertyId?: string },
    host: string
  ) {
    const queryRunner = (
      await getDatasource().initialize()
    ).createQueryRunner();

    // establish real database connection using our new query runner
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      cardPayment.metadata.ipAddress = '127.0.0.1';
      cardPayment.metadata.sessionId = 'DE6FA86F60BB47B379307F851E238617';
      const propertyId = cardPayment.propertyId;
      delete cardPayment.propertyId;
      const property = (
        await this.getProperty(queryRunner.manager, propertyId || '')
      )[0];
      const cardPaymentResponse = await this.circleCreateCardPayment(
        cardPayment
      );
      const cardPaymentData = {
        ...cardPaymentResponse,
        paymentId: cardPaymentResponse?.id,
        property,
        user,
      };
      cardPaymentData.id = uuidv4();
      const result = await queryRunner.manager.save(
        CardPaymentEntity,
        cardPaymentData
      );
      if (result) {
        await this.addCardPaymentTransactionUpdatingReserveOnERC20(
          queryRunner.manager,
          result as unknown as CardPaymentEntity,
          property
        );
        await queryRunner.commitTransaction();

        return result;
      } else {
        this.logger.error(
          'transaction cannot be stored, card payment does not exist',
          { cardPayment }
        );
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  async circleCreateCardPayment(cardPayment: PaymentCreationRequest) {
    try {
      const circle = new Circle(config.circleApiKey, config.circleBaseUrl);
      const result = await circle.payments.createPayment(cardPayment);
      return result.data.data;
    } catch (error) {
      error.message = `Error creating card payment on circle: [${error?.response?.data?.code}]-${error?.response?.data?.message}`;
      throw error;
    }
  }
  async addCardPaymentTransactionUpdatingReserveOnERC20(
    queryRunner: EntityManager,
    cardPayment: CardPaymentEntity,
    property: PropertyEntity
  ) {
    if (cardPayment.property) {
      const tokens = parseInt(
        String(
          (parseFloat(cardPayment.amount.amount) * 1000) /
            cardPayment.property.tokenPrice
        )
      );
      const transaction = {
        id: uuidv4(),
        property: property,
        cardPayment,
        user: cardPayment.user,
        tokens,
        amount: parseInt(cardPayment.amount.amount), // TODO no es parse int
        amountType: cardPayment.amount.currency,
        paymentStatus: Status.Process,
        type: TransactionType.Buy,
      };
      await queryRunner.save(TransactionEntity, transaction);
      await this.updateReserveSupply(queryRunner, property, tokens);
    }
  }

  async getCardPayment(queryRunner: EntityManager, id: string) {
    return (
      await queryRunner.find(CardPaymentEntity, {
        where: { id },
        relations: ['property'],
      })
    )[0];
  }

  async finishFailedCardPayment(id: string) {
    const queryRunner = (
      await getDatasource().initialize()
    ).createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.updateCardTransaction(queryRunner.manager, id, Status.Error);
      const updatedCardPayment = await this.updateCardPayment(
        queryRunner.manager,
        id,
        {
          confirmed: true,
        }
      );
      const tokens = parseInt(
        String(
          (parseFloat(updatedCardPayment.amount.amount) * 1000) /
            updatedCardPayment.property.tokenPrice
        )
      );
      const property = await this.getProperty(
        queryRunner.manager,
        updatedCardPayment.property.id
      );

      await this.updateReserveSupply(queryRunner.manager, property[0], -tokens);
      await queryRunner.commitTransaction();
    } catch (err) {
      this.logger.error(
        'There is a card payment without process finished:' + err.message,
        {
          cardPaymentId: id,
        }
      );
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async finishCardPayment(id: string) {
    const queryRunner = (
      await getDatasource().initialize()
    ).createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const updatedCardPayment = await this.updateCardPayment(
        queryRunner.manager,
        id,
        {
          confirmed: true,
        }
      );

      await this.updateCardTransaction(queryRunner.manager, id);
      const tokens = parseInt(
        String(
          (parseFloat(updatedCardPayment.amount.amount) * 1000) /
            updatedCardPayment.property.tokenPrice
        )
      );
      const property = await this.getProperty(
        queryRunner.manager,
        updatedCardPayment.property.id
      );
      const { balance, hash } = await this.buyTokensOnErc20(
        queryRunner.manager,
        property[0],
        updatedCardPayment.user as UserEntity,
        updatedCardPayment.amount.currency,
        updatedCardPayment.amount.amount,
        updatedCardPayment.amount.amount,
        tokens,
        '0x4a52Ccf184305CF6019D411A8BECBE8c53d946e0', // TODO this address maybe connected wallet in user
        id
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
    } catch (err) {
      this.logger.error(
        'There is a card payment without process finished:' + err.message,
        {
          cardPaymentId: id,
        }
      );
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  async updateCardTransaction(
    queryRunner: EntityManager,
    id: string,
    paymentStatus = Status.Paid
  ) {
    const transactionInDB = (
      await queryRunner.find(TransactionEntity, {
        where: {
          cardPayment: {
            id,
          },
        },
      })
    )[0];
    return await queryRunner.update(
      TransactionEntity,
      { id: transactionInDB.id },
      { paymentStatus }
    );
  }

  async updateCardPayment(
    queryRunner: EntityManager,
    id: string,
    updatedData: QueryDeepPartialEntity<CardPaymentEntity>
  ) {
    await queryRunner.update(CardPaymentEntity, { id }, updatedData);
    return await this.getCardPayment(queryRunner, id);
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
        const { balance, hash } = await this.buyOnErc20(result);
        return { balance, hash };
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
      await this._confirmBalance(queryRunner.manager, balance.id, hash);

      await this._updatePropertyTokens(
        queryRunner.manager,
        property,
        balance.tokens
      );

      await this.updateCurrentSupply(queryRunner.manager, property, tokens);

      await this.updateCardTransaction(
        queryRunner.manager,
        balance.paymentId,
        Status.Tokenized
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
}
