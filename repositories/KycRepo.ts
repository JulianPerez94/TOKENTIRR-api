import { FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Repository } from '../layers';
import KycEntity from '../model/KycEntity';

@Repository()
export default class KycRepo {
  find(query: FindOptionsWhere<KycEntity>) {
    return KycEntity.find({
      where: query,
    });
  }

  findOne(query: FindOptionsWhere<KycEntity>) {
    return KycEntity.findOne({
      where: query,
    });
  }

  save(kyc: Partial<KycEntity>) {
    return KycEntity.save(kyc) as unknown as KycEntity;
  }

  async updateOne(id: string, updateData: QueryDeepPartialEntity<KycEntity>) {
    return await KycEntity.update(
      {
        id,
      },
      updateData
    );
  }
}
