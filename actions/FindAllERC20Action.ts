import { Action } from '../layers';
import ERC20Service from '../services/ERC20Service';

@Action()
export default class FindAllERC20Action {
  constructor(readonly service: ERC20Service) {}

  async find() {
    return await this.service.findAll();
  }
}
