import { Head, HttpCode, Post, Req } from 'routing-controllers';
import { Controller } from 'routing-controllers';
import * as rawbody from 'raw-body';
import CirclePaymentAction from '../../actions/CirclePaymentAction';
import CircleTransactionProcessAction from '../../actions/CircleTransactionProcessAction';
import CirclePaymentNotificationAction from '../../actions/CirclePaymentNotificationAction';
import { OpenAPI } from 'routing-controllers-openapi';
import PaidPayment from './payments';
import { PaymentIntent } from '@circle-fin/circle-sdk';
import { Service } from 'typedi';
import { Request } from 'koa';
export type BodyMessage = {
  clientId: string;
  notificationType: string;
  version: number;
  customAttributes: unknown;
  paymentIntent?: PaymentIntent;
  payment?: PaidPayment;
};
@Controller('/api/v1')
@Service()
export default class CirclePaymentsWebhookController {
  constructor(
    readonly circlePaymentAction: CirclePaymentAction,
    readonly circlePaymentNotificationAction: CirclePaymentNotificationAction,
    readonly circleTransactionProcessAction: CircleTransactionProcessAction
  ) {}
  @OpenAPI({
    summary: 'Provides a channel comunication with circle for payments HEAD',
    responses: {
      200: {
        description: 'Successfull payment attended',
      },
    },
  })
  @HttpCode(200)
  @Head('/circle-payments-webhook')
  async headForPayment(): Promise<unknown> {
    return {};
  }

  @OpenAPI({
    summary: 'Provides a channel comunication with circle for payments POST',
    responses: {
      200: {
        description: 'Successfull payment attended',
      },
    },
  })
  @HttpCode(200)
  @Post('/circle-payments-webhook')
  async payment(@Req() req: Request): Promise<unknown> {
    let payload;
    if (req?.req?.readable) {
      const raw = await rawbody(req.req);
      console.log(raw.toString().trim());
      const text: { Message: string } = JSON.parse(raw.toString().trim());
      payload = JSON.parse(text['Message']) as BodyMessage;
    }
    if (payload?.payment && payload.payment.status === 'paid') {
      await this.circlePaymentAction.execute(payload?.payment as PaidPayment);
    } else if (payload?.payment && payload.payment.status === 'pending') {
      await this.circleTransactionProcessAction.execute(
        payload?.payment as PaidPayment
      );
    } else if (
      payload?.paymentIntent &&
      payload?.paymentIntent?.timeline?.filter((i) => i.status === 'pending')
        .length
    ) {
      const paymentIntent = payload.paymentIntent;
      await this.circlePaymentNotificationAction.addTransaction(paymentIntent);
    }
    return {};
  }
}
