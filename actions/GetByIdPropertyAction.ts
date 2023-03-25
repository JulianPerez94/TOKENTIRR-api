import { Action } from '../layers';
import PropertyService from '../services/PropertyService';

@Action()
export default class GetByIdPropertyAction {
  constructor(readonly propertyService: PropertyService) {}

  async find(id: string) {
    return await this.propertyService.findById(id);
  }
}
