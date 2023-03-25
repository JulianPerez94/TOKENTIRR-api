import { Action } from '../layers';
import PropertyEntity from '../model/PropertyEntity';
import PropertyService from '../services/PropertyService';

@Action()
export default class CreatePropertyAction {
  constructor(readonly propertyService: PropertyService) {}

  async do(property: PropertyEntity) {
    return await this.propertyService.create(property);
  }
}
