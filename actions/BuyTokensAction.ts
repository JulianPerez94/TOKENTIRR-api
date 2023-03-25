import { Action } from '../layers';
import UserEntity from '../model/UserEntity';
import BalanceService from '../services/BalanceService';
import PropertyService from '../services/PropertyService';
import BalanceEntity from '../model/BalanceEntity';

@Action()
export default class BuyTokensAction {
  constructor(
    readonly propertyService: PropertyService,
    readonly balanceService: BalanceService
  ) {}

  async buy(
    propertyId: string,
    type: string,
    account: string,
    investment: number,
    dolars: number,
    user: UserEntity
  ) {
    const property = await this.propertyService.findById(propertyId);
    if (property && property.erc20) {
      const result = (await this.balanceService.saveBalance(
        user,
        property,
        property.erc20,
        type,
        account,
        investment,
        dolars
      )) as BalanceEntity;
      return await this.balanceService.buy(result);
    }
  }
}
