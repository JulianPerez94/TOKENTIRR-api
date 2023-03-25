import { Get, HttpCode } from 'routing-controllers';
import { Controller } from '../../layers';
import PropertyEntity from '../../model/PropertyEntity';
import GetMarketplace from '../../actions/GetMarketplaceAction';
import { OpenAPI } from 'routing-controllers-openapi';
import schemas from '../schemas';

@Controller('/api/v1')
export default class GetMarketplaceController {
  constructor(readonly getMarketplace: GetMarketplace) {}
  @OpenAPI({
    summary: 'Get marketplace public properties',
    responses: {
      200: {
        description: 'All public properties',
        content: {
          'application/json': {
            schema: schemas.Property,
          },
        },
      },
    },
  })
  @HttpCode(200)
  @Get('/marketplace')
  async marketplace(): Promise<PropertyEntity[]> {
    return await this.getMarketplace.find();
  }
}
