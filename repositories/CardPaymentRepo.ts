import { FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Repository } from '../layers';
import CardPaymentEntity from '../model/CardPaymentEntity';

@Repository()
export default class CardPaymentRepo {
  find(query: FindOptionsWhere<CardPaymentEntity>) {
    return CardPaymentEntity.find({
      where: query,
      relations: ['property', 'user'],
    });
  }

  save(cardPayment: Partial<CardPaymentEntity>) {
    return CardPaymentEntity.save(cardPayment);
  }
  async updateOne(
    id: string,
    updateData: QueryDeepPartialEntity<CardPaymentEntity>
  ) {
    return await CardPaymentEntity.update(
      {
        id,
      },
      updateData
    );
  }
}
