import { FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Repository } from '../layers';
import PropertyEntity from '../model/PropertyEntity';

@Repository()
export default class PropertyRepo {
  find(query: FindOptionsWhere<PropertyEntity>) {
    return PropertyEntity.find({
      where: query,
      relations: ['erc20'],
    });
  }

  save(property: Partial<PropertyEntity>) {
    return PropertyEntity.save(property);
  }

  async updateOne(
    id: string,
    updateData: QueryDeepPartialEntity<PropertyEntity>
  ) {
    return await PropertyEntity.update(
      {
        id,
      },
      updateData
    );
  }
}
