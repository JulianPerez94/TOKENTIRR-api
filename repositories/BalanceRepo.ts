import { FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Repository } from '../layers';
import BalanceEntity from '../model/BalanceEntity';

@Repository()
export default class BalanceRepo {
  find(query: FindOptionsWhere<BalanceEntity>) {
    return BalanceEntity.find({
      where: query,
      relations: ['erc20']
    });
  }

  save(property: Partial<BalanceEntity>) {
    return BalanceEntity.save(property);
  }

  async updateOne(
    id: string,
    updateData: QueryDeepPartialEntity<BalanceEntity>
  ) {
    return await BalanceEntity.update(
      {
        id,
      },
      updateData
    );
  }
}
