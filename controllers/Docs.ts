import App from '../App';
import { Controller } from '../layers';
import { Get, HttpCode } from 'routing-controllers';

@Controller('/api/v1/docs')
export default class Docs {
  @Get('/')
  @HttpCode(200)
  async _index() {
    return App.spec;
  }
}
