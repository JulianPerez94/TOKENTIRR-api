import { Action } from '../layers';
import UserEntity from '../model/UserEntity';
import ERC20Service from '../services/ERC20Service';
import PropertyService from '../services/PropertyService';

@Action()
export default class DeployERC20Action {
  constructor(
    readonly propertyService: PropertyService,
    readonly service: ERC20Service
  ) {}

  async deploy(propertyId: string, bankAccount: string, user: UserEntity) {
    const property = await this.propertyService.findById(propertyId);
    return await this.service.deploy(user, property, bankAccount);
  }
}
