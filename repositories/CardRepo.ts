import { FindOptionsWhere } from 'typeorm';
import { Repository } from '../layers';
import CardEntity from '../model/CardEntity';

@Repository()
export default class CardRepo {
  find(query: FindOptionsWhere<CardEntity>) {
    return CardEntity.find({
      where: query,
    });
  }

  save(card: Partial<CardEntity>) {
    return CardEntity.save(card);
  }
}
