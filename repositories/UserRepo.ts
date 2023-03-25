import { FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Repository } from '../layers';
import UserEntity from '../model/UserEntity';

@Repository()
export default class UserRepo {
  findOne(query: FindOptionsWhere<UserEntity>) {
    return UserEntity.findOne({
      where: query,
      relations: ['kyc'],
    });
  }
  findOneOrFail(query: FindOptionsWhere<UserEntity>) {
    return UserEntity.findOneOrFail({
      where: query,
    });
  }
  save(user: Partial<UserEntity>) {
    return UserEntity.save(user);
  }
  async updateOne(id: string, updateData: QueryDeepPartialEntity<UserEntity>) {
    return await UserEntity.update(
      {
        id,
      },
      updateData
    );
  }
}
