import { FindOptionsWhere, LessThan } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Repository } from '../layers';
import PaymentEntity from '../model/PaymentEntity';

@Repository()
export default class PaymentRepo {
  findExpiredOnes() {
    return PaymentEntity.find({
      where: {
        expiresOn: LessThan(new Date().toISOString()),
      },
      relations: ['property'],
    });
  }
  find(query: FindOptionsWhere<PaymentEntity>) {
    return PaymentEntity.find({
      where: query,
      relations: ['user', 'property'],
    });
  }

  save(payment: Partial<PaymentEntity>) {
    return PaymentEntity.save(payment);
  }

  async updateOne(
    id: string,
    updateData: QueryDeepPartialEntity<PaymentEntity>
  ) {
    return await PaymentEntity.update(
      {
        id,
      },
      updateData
    )
      .then(async () => {
        return (
          await PaymentEntity.find({
            where: { id },
            relations: ['user', 'property'],
          })
        )[0];
      })
      .catch((e) => {
        throw e;
      });
  }
}
