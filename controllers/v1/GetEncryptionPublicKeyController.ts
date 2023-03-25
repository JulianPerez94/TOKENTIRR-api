import { Authorized, Get, HttpCode } from 'routing-controllers';
import { Controller } from '../../layers';
import GetEncryptionPublicKeyAction from '../../actions/GetEncryptionPublicKeyAction';

export type PublicKeyData = {
  keyId: string;
  publicKey: string;
};

@Controller('/api/v1')
export default class GetEncryptionPublicKeyController {
  constructor(
    readonly getEncryptionPublicKeyAction: GetEncryptionPublicKeyAction
  ) {}
  @HttpCode(200)
  @Get('/encryption/public-key')
  @Authorized()
  async get(): Promise<PublicKeyData> {
    return (await this.getEncryptionPublicKeyAction.get()) as unknown as PublicKeyData;
  }
}
