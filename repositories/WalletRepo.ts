import { FindOptionsWhere } from 'typeorm';
import { Repository } from '../layers';
import WalletEntity from '../model/WalletEntity';

@Repository()
export default class WalletRepo {
  find(query: FindOptionsWhere<WalletEntity>) {
    return WalletEntity.find({
      where: query,
    });
  }

  save(cardPayment: Partial<WalletEntity>) {
    return WalletEntity.save(cardPayment);
  }
}
