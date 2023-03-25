import { Get, HttpCode } from 'routing-controllers';
import { Controller } from '../../layers';
import { OpenAPI } from 'routing-controllers-openapi';
import schemas from '../schemas';

@Controller('/api/v1')
export default class HealthzController {
  @OpenAPI({
    summary:
      'A simple "pong" like action that returns, used to ping the server.',
    responses: {
      200: {
        description: 'OK - The server is alive',
        content: {
          'application/json': {
            schema: schemas.Healthz,
          },
        },
      },
    },
  })
  @HttpCode(200)
  @Get('/healthz')
  async index(): Promise<{ status: 'ok' }> {
    return {
      status: 'ok',
    };
  }
}
