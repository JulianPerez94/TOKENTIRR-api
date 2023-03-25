import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BalanceModel, ERC20Model, PropertyModel } from './models';

export class Healthz {
  @IsBoolean()
    status: string;
}
export class PropertyBody {
  @IsString()
    mainImage: string;
  @IsString()
    description: string;
  @IsString()
    images: string[];
  @IsString()
    street: string;
  @IsString()
    streetNumber: string;
  @IsString()
    city: string;
  @IsString()
    state: string;
  @IsString()
    postalCode: string;
  @IsInt()
    tokenPrice: number;
  @IsInt()
    fiatTotalPrice: number;
  @IsInt()
    availableTokens: number;
  @IsInt()
    totalTokens: number;
  @IsInt()
    closingCosts: number;
  @IsInt()
    companyIncorporationExpenses: number;
  @IsInt()
    initialMaintenanceReserve: number;
  @IsInt()
    vacancyReserve: number;
  @IsInt()
    tokentirrFee: number;
  @IsInt()
    irr: number;
  @IsInt()
    roi: number;
  @IsInt()
    inversionAverageValue: number;
  @IsInt()
    annualGrossRents: number;
  @IsInt()
    municipalTaxes: number;
  @IsInt()
    homeownersInsurance: number;
  @IsInt()
    propertyManagement: number;
  @IsInt()
    llcAndFilingFees: number;
  @IsInt()
    annualCashFlow: number;
  @IsInt()
    monthlyCashFlow: number;
}
export class Property extends PropertyBody {
  @IsString()
    id: string;
  @ValidateNested()
  @IsOptional()
  @Type(() => ERC20Model)
    erc20?: ERC20Model;
  @IsDate()
    createdAt: Date;
  @IsDate()
    updatedAt: Date;
  @IsDate()
    deletedAt: Date | null;
}
export class Balance {
  @IsString()
    id: string;
  @IsString()
    tokens: string;
  @IsString()
    type: string;
  @IsString()
  @IsOptional()
    account?: string;
  @IsBoolean()
  @IsOptional()
    confirmed?: boolean;
  @IsString()
  @IsOptional()
    hash?: string;
  @IsString()
    investment: string;
  @IsString()
    dolars: string;
  @IsDate()
    createdAt: Date;
  @IsDate()
    updatedAt: Date;
  @IsDate()
    deletedAt: Date | null;
}
export class ERC20 {
  @IsString()
    id: string;
  @IsString()
    deployerId: string;
  @IsInt()
    supply: number;
  @IsString()
    bankAccount: string;
  @ValidateNested()
  @Type(() => PropertyModel)
    property: PropertyModel;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BalanceModel)
    balances?: BalanceModel[];
  @IsString()
    contractAddress: string;
  @IsOptional()
  @IsDate()
    createdAt: Date;
  @IsOptional()
  @IsDate()
    updatedAt: Date;
  @IsOptional()
  @IsDate()
    deletedAt: Date | null;
}

export class DeployERC20Body {
  @IsString()
    propertyId: string;
  @IsString()
    bankAccount: string;
}

export class BuyTokensBody {
  @IsString()
    propertyId: string;
  @IsString()
    type: string;
  @IsString()
    account: string;
  @IsNumber()
    investment: number;
  @IsNumber()
    dolars: number;
}

export class RegisterBody {
  @IsString()
    email: string;
  @IsString()
    password: string;
}

export class Token {
  @IsString()
    accessToken: string;
}

export class User {
  @IsString()
    id: string;
  @IsString()
    email: string;
  @IsString()
    password: string;
  @IsOptional()
  @IsDate()
    createdAt: Date;
  @IsOptional()
  @IsDate()
    updatedAt: Date;
  @IsOptional()
  @IsDate()
    deletedAt: Date | null;
}
export default validationMetadatasToSchemas({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  classTransformerMetadataStorage: require('class-transformer/cjs/storage')
    .defaultMetadataStorage,
}) as Record<
  | 'Healthz'
  | 'Property'
  | 'ERC20'
  | 'Balance'
  | 'User'
  | 'Token'
  | 'BuyTokensBody'
  | 'RegisterBody'
  | 'DeployERC20Body'
  | 'PropertyBody',
  import('openapi3-ts').SchemaObject
>;
