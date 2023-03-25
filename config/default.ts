import * as dotenv from 'dotenv';
dotenv.config();

function die(what: Error | string): never {
  if (typeof what === 'string') {
    throw new Error(what);
  }
  throw what;
}

const config = {
  environment:
    process.env.NODE_ENV ??
    die('Environment variable "NODE_ENV" wasn\'t defined!'),
  port:
    process.env.RESTAPI_PORT ??
    die('Environment variable "RESTAPI_PORT" wasn\'t defined!'),
  version:
    process.env.RESTAPI_VERSION ??
    die('Environment variable "RESTAPI_VERSION" wasn\'t defined!'),
  dbName:
    process.env.POSTGRES_DB ??
    die('Environment variable "POSTGRES_NAME" wasn\'t defined!'),
  dbUser:
    process.env.POSTGRES_USER ??
    die('Environment variable "POSTGRES_USER" wasn\'t defined!'),
  dbPass:
    process.env.POSTGRES_PASSWORD ??
    die('Environment variable "POSTGRES_PASSWORD" wasn\'t defined!'),
  dbHost:
    process.env.POSTGRES_HOST ??
    die('Environment variable "POSTGRES_HOST" wasn\'t defined!'),
  dbPort:
    process.env.POSTGRES_PORT ??
    die('Environment variable "POSTGRES_PORT" wasn\'t defined!'),
  salt:
    process.env.SALT_SECRET ??
    die('Environment variable "SALT_SECRET" wasn\'t defined!'),
  authSecret:
    process.env.AUTH_JWT_SECRET ??
    die('Environment variable "AUTH_JWT_SECRET" wasn\'t defined!'),
  tokenExpiration:
    process.env.TOKEN_EXPIRATION_MS ??
    die('Environment variable "TOKEN_EXPIRATION_MS" wasn\'t defined!'),
  circleApiKey:
    process.env.CIRCLE_API_KEY ??
    die('Environment variable "CIRCLE_API_KEY" wasn\'t defined!'),
  circleBaseUrl:
    process.env.CIRCLE_BASE_URL ??
    die('Environment variable "CIRCLE_BASE_URL" wasn\'t defined!'),
  rpc:
    process.env.RPC_CONNECTION ??
    die('Environment variable "RPC_CONNECTION" wasn\'t defined!'),
  privateKey:
    process.env.WALLET_PRIVATE_KEY ??
    die('Environment variable "WALLET_PRIVATE_KEY" wasn\'t defined!'),
  address:
    process.env.WALLET_ADDRESS ??
    die('Environment variable "WALLET_ADDRESS" wasn\'t defined!'),
  validatedEmails:
    process.env.VALIDATED_USER_EMAILS ??
    die('Environment variable "VALIDATED_USER_EMAILS" wasn\'t defined!'),
  kycBaseUrl:
    process.env.KYC_BASE_URL ??
    die('Environment variable "KYC_BASE_URL" wasn\'t defined!'),
  KycLevel:
    process.env.KYC_LEVEL ??
    die('Environment variable "KYC_LEVEL" wasn\'t defined!'),
  kycAppToken:
    process.env.KYC_APP_TOKEN ??
    die('Environment variable "KYC_APP_TOKEN" wasn\'t defined!'),
  kycSecretKey:
    process.env.KYC_SECRET_KEY ??
    die('Environment variable "KYC_SECRET_KEY" wasn\'t defined!'),
  polygonProvider:
    process.env.POLYGON_PROVIDER_RPC ??
    die('Environment variable "POLYGON_PROVIDER_RPC" wasn\'t defined!'),
  cardPaymentIntervalTimeout:
    process.env.CARD_PAYMENT_INTERVAL_TIMEOUT ??
    die(
      'Environment variable "CARD_PAYMENT_INTERVAL_TIMEOUT" wasn\'t defined!'
    ),
};
export default config;
