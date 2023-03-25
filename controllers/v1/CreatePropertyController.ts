import { Authorized, Body, HttpCode, Post } from 'routing-controllers';
import { Controller } from '../../layers';
import CreatePropertyAction from '../../actions/CreatePropertyAction';
import PropertyEntity from '../../model/PropertyEntity';
import { OpenAPI } from 'routing-controllers-openapi';
import schemas from '../schemas';

@Controller('/api/v1')
export default class CreatePropertyController {
  constructor(readonly createPropertyAction: CreatePropertyAction) {}
  @OpenAPI({
    summary: 'Create a property',
    security: [
      {
        bearerAuth: [],
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: schemas.PropertyBody,
        },
      },
    },
    responses: {
      201: {
        description: 'Created property',
        content: {
          'application/json': {
            schema: schemas.Property,
          },
        },
      },
      401: {
        description: 'Authorization Rejected',
      },
    },
  })
  @HttpCode(201)
  @Post('/property')
  @Authorized()
  async create(
    @Body()
      body: PropertyEntity
  ): Promise<PropertyEntity> {
    return (await this.createPropertyAction.do(body)) as PropertyEntity;
  }
}
