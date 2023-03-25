import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Balance, Property } from '../schemas';
class ERC20Model {
  @IsString()
    id: string;
  @IsString()
    contractAddress: string;
  @IsString()
    deployerId: string;
  @IsInt()
    supply: number;
  @IsString()
    bankAccount: string;
  @Type(() => Property)
    property: Property;
  @ValidateNested({ each: true })
  @Type(() => Balance)
    balances: Balance[];
  @IsDate()
    createdAt: Date;
  @IsDate()
    updatedAt: Date;
  @IsDate()
    deletedAt: Date | null;
}
class PropertyModel {
  @IsString()
    id: string;
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
class BalanceModel {
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

export { PropertyModel, BalanceModel, ERC20Model };
