import { Service } from '../layers';
import PropertyRepo from '../repositories/PropertyRepo';

@Service()
export default class MarketplaceService {
  constructor(readonly propertiesRepo: PropertyRepo) {}

  async find() {
    return await this.propertiesRepo.find({});
  }
}
