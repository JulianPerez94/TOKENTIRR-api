import { FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Repository } from '../layers';
import TransactionsEntity from '../model/TransactionsEntity';

@Repository()
export default class TransactionRepo {
  async find(query: FindOptionsWhere<TransactionsEntity>) {
    return await TransactionsEntity.find({
      where: query,
      relations: ['property', 'payment', 'cardPayment'],
    });
  }

  async save(transaction: Partial<TransactionsEntity>) {
    return await TransactionsEntity.save(transaction);
  }

  async updateOne(
    id: string,
    updateData: QueryDeepPartialEntity<TransactionsEntity>
  ) {
    return await TransactionsEntity.update(
      {
        id,
      },
      updateData
    );
  }
}
