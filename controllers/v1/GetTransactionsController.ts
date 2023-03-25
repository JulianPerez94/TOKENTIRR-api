import { CurrentUser, Get, HttpCode, Param } from 'routing-controllers';
import { Controller } from '../../layers';
import GetTransactionAction from '../../actions/GetTransactionAction';
import GetTransactionsByUserAction from '../../actions/GetTransactionsByUserAction';
import TransactionEntity from '../../model/TransactionsEntity';
import UserEntity from '../../model/UserEntity';

@Controller('/api/v1')
export default class GetTransactionsController {
  constructor(
    readonly getTransactionAction: GetTransactionAction,
    readonly getTransactionsByUserAction: GetTransactionsByUserAction
  ) {}
  @HttpCode(200)
  @Get('/transaction/:paymentIntentid')
  async findOne(
    @Param('paymentIntentid')
      id: string
  ): Promise<TransactionEntity> {
    {
      return await this.getTransactionAction.findOne(id);
    }
  }

  @HttpCode(200)
  @Get('/transaction')
  async findByUser(
    @CurrentUser()
      user: UserEntity
  ): Promise<TransactionEntity[]> {
    {
      return await this.getTransactionsByUserAction.findAll(user);
    }
  }
}
