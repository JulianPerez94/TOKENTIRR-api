import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

import { Money } from '@circle-fin/circle-sdk';

/**
 * Example model entity.
 */
@Entity()
export default class WalletEntity extends BaseEntity {
  @PrimaryColumn('uuid')
    id: string;

  @Column()
    walletId: string; //SGP Revisar IDs

  @Column()
    entityId: string;

  @Column()
    type: string;

  @Column()
    description: string;

  @Column()
    propertyId: string;

  @Column('simple-array')
    balances: Money[];

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;

  @DeleteDateColumn({ nullable: true, default: null })
    deletedAt?: Date | null;
}
