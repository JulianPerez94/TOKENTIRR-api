import { KoaMiddlewareInterface, Middleware } from 'routing-controllers';
import * as Application from 'koa';
import Container from 'typedi';
import { Service } from 'typedi';
import CustomLogger from '../infrastructure/CustomLogger';
const logger = Container.get(CustomLogger);
const SERVER_ERROR = 500;
const NO_CONTENT = 204;
const NOT_FOUND = 404;

@Service()
@Middleware({ type: 'before' })
export default class ErrorHandler implements KoaMiddlewareInterface {
  public async use(context: Application.Context, next: Application.Next) {
    try {
      await next();
    } catch (error) {
      logger.error(
        `Internal error ocurred: ${error.message}\nCaused by ${error.stack}\n`,
        { error }
      );
      const status = error.httpCode || SERVER_ERROR;
      context.status = status;
      context.body = {
        message: error.message,
      };
      return;
    }
    if (context.response.body == null && context.status !== NO_CONTENT) {
      context.status = NOT_FOUND;
      context.body = {
        message: 'Not found',
      };
    }
  }
}
