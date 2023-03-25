import { v4 as uuidv4 } from 'uuid';
import { Service } from '../layers';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import config from '../config/default';
import { AccessTokenResponse } from '../controllers/v1/KycController';
import * as CryptoJS from 'crypto-js';
import KycRepo from '../repositories/KycRepo';
import UserRepo from '../repositories/UserRepo';
import KycEntity from '../model/KycEntity';

function createSignature2(KycConfig: AxiosRequestConfig<unknown> = {}) {
  if (KycConfig.method && KycConfig.headers && KycConfig.url) {
    const stamp = Math.floor(Date.now() / 1000);
    let valueToSign: string =
      stamp + KycConfig.method.toUpperCase() + KycConfig.url;
    valueToSign = valueToSign.replace(config.kycBaseUrl, '');

    const signature = CryptoJS.enc.Hex.stringify(
      CryptoJS.HmacSHA256(valueToSign, config.kycSecretKey)
    );

    KycConfig.headers['X-App-Token'] = config.kycAppToken;
    KycConfig.headers['X-App-Access-Ts'] = stamp;
    KycConfig.headers['X-App-Access-Sig'] = signature;
  }

  return KycConfig;
}

@Service()
export default class KycService {
  constructor(readonly kycRepo: KycRepo, readonly userRepo: UserRepo) {}
  async getAccessToken(userId: string): Promise<AccessTokenResponse> {
    axios.interceptors.request.use(createSignature2, function (error) {
      return Promise.reject(error);
    });

    return await axios
      .post(
        `${config.kycBaseUrl}/resources/accessTokens?userId=${userId}&levelName=${config.KycLevel}`,
        ''
      )
      .then((res) => res.data)
      .catch((error: AxiosError) => {
        error.message = `Error getting token from kyc: [${error?.response?.data?.code}]-${error?.response?.data?.message}`;
        throw error;
      });
  }

  async upsertKycApplicant(kyc: KycEntity) {
    const kycExist = await this.kycRepo.findOne({
      applicantId: kyc.applicantId,
    });
    const user = await this.userRepo.findOne({ id: kyc.externalUserId });
    if (!kycExist && user) {
      kyc.id = uuidv4();
      kyc.user = user;
      const kycResponse = await this.kycRepo.save(kyc);
      if (kycResponse) {
        await this.userRepo.updateOne(kyc.externalUserId, {
          kyc: kycResponse as unknown as KycEntity,
        });
      }

      return {};
    }

    if (kycExist && user) {
      kyc.user = user;
      const updateKycData = {
        type: kyc.type,
        reviewStatus: kyc.reviewStatus,
        reviewResult: kyc.reviewResult,
        applicantType: kyc.applicantType,
      };

      const updateResult = await this.kycRepo.updateOne(
        kycExist.id,
        updateKycData
      );
      return updateResult;
    }
  }
}
