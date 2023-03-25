import { FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Repository } from '../layers';
import ERC20Entity from '../model/ERC20Entity';

@Repository()
export default class ERC20Repo {
  find(query: FindOptionsWhere<ERC20Entity>) {
    return ERC20Entity.find({
      where: query,
      relations: ['property', 'balances'],
    });
  }

  save(contract: Partial<ERC20Entity>) {
    return ERC20Entity.save(contract);
  }

  async updateOne(id: string, updateData: QueryDeepPartialEntity<ERC20Entity>) {
    return await ERC20Entity.update({ id }, updateData);
  }
}
