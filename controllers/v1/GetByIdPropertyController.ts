import { Get, HttpCode, Param } from 'routing-controllers';
import { Controller } from '../../layers';
import GetByIdPropertyAction from '../../actions/GetByIdPropertyAction';
import PropertyEntity from '../../model/PropertyEntity';
import { OpenAPI } from 'routing-controllers-openapi';
import schemas from '../schemas';
import params from '../params';

@Controller('/api/v1')
export default class GetByIdPropertyController {
  constructor(readonly getByIdPropertyAction: GetByIdPropertyAction) {}
  @OpenAPI({
    summary: 'Get a single property',
    parameters: [params.id],
    responses: {
      200: {
        description: 'A single property',
        content: {
          'application/json': {
            schema: schemas.Property,
          },
        },
      },
    },
  })
  @HttpCode(200)
  @Get('/property/:id')
  async create(
    @Param('id')
      id: string
  ): Promise<PropertyEntity> {
    return (await this.getByIdPropertyAction.find(id)) as PropertyEntity;
  }
}
