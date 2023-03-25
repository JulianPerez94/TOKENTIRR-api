import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import ERC20Entity from './ERC20Entity';

/**
 * Example model entity.
 */
@Entity()
export default class PropertyEntity extends BaseEntity {
  @PrimaryColumn('uuid')
    id: string;

  @Column()
    mainImage: string;

  @Column()
    description: string;

  @Column('simple-array')
    images: string[];

  @Column()
    street: string;

  @Column()
    streetNumber: string;

  @Column()
    city: string;

  @Column()
    state: string;

  @Column()
    postalCode: string;

  @Column()
    tokenPrice: number;

  @Column({ type: 'bigint' })
    fiatTotalPrice: number;

  @Column()
    availableTokens: number;

  @Column()
    totalTokens: number;

  @Column()
    closingCosts: number;

  @Column()
    companyIncorporationExpenses: number;

  @Column()
    initialMaintenanceReserve: number;

  @Column()
    vacancyReserve: number;

  @Column()
    tokentirrFee: number;

  @Column()
    irr: number;

  @Column()
    roi: number;

  @Column()
    inversionAverageValue: number;

  @Column()
    annualGrossRents: number;

  @Column()
    municipalTaxes: number;

  @Column()
    homeownersInsurance: number;

  @Column()
    propertyManagement: number;

  @Column()
    llcAndFilingFees: number;

  @Column()
    annualCashFlow: number;

  @Column()
    monthlyCashFlow: number;

  @OneToOne(() => ERC20Entity)
  @JoinColumn()
    erc20?: ERC20Entity;

  @CreateDateColumn({ nullable: true, default: null })
    startAt: Date;

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;

  @DeleteDateColumn({ nullable: true, default: null })
    deletedAt?: Date | null;
}
