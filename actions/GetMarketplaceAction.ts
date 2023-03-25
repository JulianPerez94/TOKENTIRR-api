import { Action } from '../layers';
import MarketplaceService from '../services/MarketplaceService';

@Action()
export default class GetCartAction {
  constructor(readonly marketplaceService: MarketplaceService) {}

  async find() {
    return await this.marketplaceService.find();
  }
}
