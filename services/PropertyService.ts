import { v4 as uuidv4 } from 'uuid';
import { Service } from '../layers';
import PropertyEntity from '../model/PropertyEntity';
import PropertyRepo from '../repositories/PropertyRepo';

@Service()
export default class PropertyService {
  constructor(readonly propertiesRepo: PropertyRepo) {}

  async create(property: PropertyEntity) {
    property.id = uuidv4();
    return await this.propertiesRepo.save(property);
  }

  async findById(id: string) {
    return (await this.propertiesRepo.find({ id }))[0];
  }
}
