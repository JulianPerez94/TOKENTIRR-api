import * as Router from 'koa-router';
import * as KoaStatic from 'koa-static';
import { koaSwagger } from 'koa2-swagger-ui';
import * as rc from 'routing-controllers';
import { Action, UnauthorizedError } from 'routing-controllers';
import * as to from 'typeorm';
import * as morgan from 'koa-morgan';
import { decode, verify } from 'jsonwebtoken';
import Docs from './controllers/Docs';
import HealthzController from './controllers/v1/HealthzController';
import KycController from './controllers/v1/KycController';
import GetMarketplaceController from './controllers/v1/GetMarketplaceController';
import AuthorizationController from './controllers/v1/AuthorizationController';
import CreatePropertyController from './controllers/v1/CreatePropertyController';
import GetByIdPropertyController from './controllers/v1/GetByIdPropertyController';
import DeployContractController from './controllers/v1/DeployContractController';
import KycApplicantCreatedWebhookController from './controllers/v1/KycApplicantCreatedWebhookController';
import KycApplicantReviewedWebhookController from './controllers/v1/KycApplicantReviewedWebhookController';
import BuyTokensController from './controllers/v1/BuyTokensController';
import CreateCardPaymentController from './controllers/v1/CreateCardPaymentController';
import CreateWalletController from './controllers/v1/CreateWalletController';
import GetEncryptionPublicKeyController from './controllers/v1/GetEncryptionPublicKeyController';
import CreateWalletAddressController from './controllers/v1/CreateWalletAddressController';
import CreateTransferController from './controllers/v1/CreateTransferController';
import CreatePaymentIntentController from './controllers/v1/CreatePaymentIntentController';
import GetTransactionsController from './controllers/v1/GetTransactionsController';
import CreateCardController from './controllers/v1/CreateCardController';
import UpdateUserController from './controllers/v1/UpdateUserController';
import ErrorHandler from './middlewares/handleErrors';
import { cors } from './middlewares/cors';
import AuthorizedAction from './actions/AuthorizedAction';
import config from './config/default';
import UserRepo from './repositories/UserRepo';
import { DeepPartial } from 'typeorm';
import UserEntiry from './model/UserEntity';
import CirclePaymentsWebhookController from './controllers/v1/CirclePaymentsWebhookController';
import GetCardPaymentAction from './actions/GetCardPaymentAction';
import CardPaymentEntity from './model/CardPaymentEntity';
import GetCardPaymentsNotConfirmedAction from './actions/GetCardPaymentsNotConfirmedAction';
import UpdateFinishCardPaymentAction from './actions/UpdateFinishCardPaymentAction';
import CustomLogger from './infrastructure/CustomLogger';
import Container from 'typedi';
import GetExpiredPaymentsAction from './actions/GetExpiredPaymentsAction';
import PaymentEntity from './model/PaymentEntity';
import RollbackExpiredPaymentsAction from './actions/RollbackExpiredPaymentsAction';
/**
 * Application bootstrap entity.
 */
export default class App {
  /**
   * OpenAPI/Swagger-like specification.
   */
  static spec?: unknown;

  /**
   * Entry point function.
   */
  static async main() {
    const router = new Router();
    router.get(
      '/docs',
      koaSwagger({
        title: 'Tokentirr',
        swaggerOptions: {
          url: '/api/v1/docs',
        },
      })
    );
    const app = rc.createKoaServer({
      controllers: [
        GetMarketplaceController,
        AuthorizationController,
        HealthzController,
        KycController,
        CreatePropertyController,
        GetByIdPropertyController,
        DeployContractController,
        BuyTokensController,
        GetEncryptionPublicKeyController,
        CreateCardPaymentController,
        CreateWalletController,
        CreateWalletAddressController,
        CreateTransferController,
        CirclePaymentsWebhookController,
        CreatePaymentIntentController,
        KycApplicantCreatedWebhookController,
        KycApplicantReviewedWebhookController,
        GetTransactionsController,
        CreateCardController,
        UpdateUserController,
        Docs,
      ],
      middlewares: [ErrorHandler],
      defaultErrorHandler: false,
      cors: true,
      async authorizationChecker(action: Action): Promise<boolean> {
        const unauthorizedMessage = 'You are not authorized';
        try {
          const token = action.request.headers.authorization?.split(' ')[1];
          if (!verify(token, config.authSecret)) {
            throw new UnauthorizedError(unauthorizedMessage);
          }
          await new AuthorizedAction().authorize(token);
          return true;
        } catch (error) {
          throw new UnauthorizedError(unauthorizedMessage);
        }
      },
      async currentUserChecker(action: Action) {
        const noTokenURLs =
          action.request.url.includes('login') ||
          action.request.url.includes('register');
        if (noTokenURLs) return null;
        const token = action.request.headers.authorization.split(' ')[1];
        const decodeUser: DeepPartial<UserEntiry> = decode(token) as {
          id: string;
        };
        if (decodeUser && decodeUser.id) {
          const user = new UserRepo().findOneOrFail({ id: decodeUser.id });
          if (user != null) return user;
        } else {
          throw new UnauthorizedError('Cannot decode User');
        }
      },
    });
    app.use(new ErrorHandler().use);
    app.use(morgan('dev'));
    app.use(cors);
    app.use(router.routes()).use(router.allowedMethods());
    app.use(KoaStatic(__dirname + '/images'));
    const dataSource = new to.DataSource({
      type: 'postgres',
      database: config.dbName,
      synchronize: true,
      host: config.dbHost,
      port: parseInt(config.dbPort as string),
      username: config.dbUser,
      password: config.dbPass,
      entities: [__dirname + '/model/*{.ts,.js}'],
      migrations: [__dirname + '/migration/*.ts'],
      migrationsTableName: 'migrations',
    });
    await dataSource.initialize().then(App.databaseReady);
    const server = app.listen(config.port, () => {
      console.log(`Listening on port ${config.port}`);
    });
    return server;
  }

  static databaseReady() {
    console.log('Ready....');
    setInterval(async function () {
      if (!['development', 'testing'].includes(config.environment)) {
        try {
          const payments: CardPaymentEntity[] = await Container.get(
            GetCardPaymentsNotConfirmedAction
          ).get();
          new CustomLogger().info(
            `Verify update card payments ${payments.length}`
          );
          for (const payment of payments) {
            const result = await Container.get(GetCardPaymentAction).get(
              payment.paymentId || ''
            );
            if (result.status === 'paid') {
              new CustomLogger().info(`Card payment confirmed ${payment.id}`, {
                result,
              });
              await Container.get(UpdateFinishCardPaymentAction).update(
                payment.id
              );
            } else if (result.status === 'failed') {
              new CustomLogger().info(`Card payment failed ${payment.id}`, {
                result,
              });
              await Container.get(UpdateFinishCardPaymentAction).update(
                payment.id,
                result.status
              );
            }
          }
        } catch (e) {
          new CustomLogger().error('Error updating card payments interval', {
            message: e.message,
            stack: e.stack,
          });
        }
      }
    }, parseInt(config.cardPaymentIntervalTimeout));
    setInterval(async function () {
      if (!['development', 'testing'].includes(config.environment)) {
        try {
          const payments: PaymentEntity[] = await Container.get(
            GetExpiredPaymentsAction
          ).get();
          new CustomLogger().info(`Verify update payments ${payments.length}`);
          for (const payment of payments) {
            await Container.get(RollbackExpiredPaymentsAction).update(payment);
          }
        } catch (e) {
          new CustomLogger().error('Error updating expired payments interval', {
            message: e.message,
            stack: e.stack,
          });
        }
      }
    }, parseInt(config.cardPaymentIntervalTimeout));
  }
}
