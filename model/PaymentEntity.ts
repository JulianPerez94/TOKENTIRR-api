import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import PropertyEntity from './PropertyEntity';

import {
  CryptoPaymentsMoneyCurrencyEnum,
  PaymentIntentSettlementCurrencyEnum,
  PaymentMethodBlockchain,
} from '@circle-fin/circle-sdk';
import UserEntity from './UserEntity';

export type Amount = {
  amount: string;
  currency: CryptoPaymentsMoneyCurrencyEnum;
};

type Fee = {
  amount: string;
  currency: 'USD';
  type: string;
};

type Timeline = {
  status: string;
  time: string;
};
export enum Status {
  Started = 'STARTED',
  Error = 'ERROR',
  Expired = 'EXPIRED',
  Pending = 'PENDING',
  Process = 'PROCESSING',
  Paid = 'PAID',
  Tokenized = 'TOKENIZED',
}
/**
 * Example model entity.
 */
@Entity()
export default class PaymentEntity extends BaseEntity {
  @PrimaryColumn('uuid')
    id: string;

  @Column({ nullable: true, default: null })
    paymentIntentId?: string;

  @Column({ nullable: true, default: null })
    paymentId?: string;

  @Column('simple-json')
    amount: Amount;

  @Column('simple-json')
    amountPaid: Amount;

  @Column()
    settlementCurrency: PaymentIntentSettlementCurrencyEnum;

  @Column({
    type: 'text',
    transformer: {
      to(input: PaymentMethodBlockchain[]) {
        return JSON.stringify(input);
      },
      from(output: string) {
        return JSON.parse(output);
      },
    },
    nullable: true,
    default: null,
  })
    paymentMethods?: PaymentMethodBlockchain[];

  @Column({
    type: 'text',
    transformer: {
      to(input: Fee[]) {
        return JSON.stringify(input);
      },
      from(output: string) {
        return JSON.parse(output);
      },
    },
    nullable: true,
    default: null,
  })
    fees?: Fee[];

  @Column('simple-array')
    paymentIds?: string[];

  @Column({
    type: 'text',
    transformer: {
      to(input: Timeline[]) {
        return JSON.stringify(input);
      },
      from(output: string) {
        return JSON.parse(output);
      },
    },
    nullable: true,
    default: null,
  })
    timeline?: Timeline[];

  @Column()
    idempotencyKey: string;

  @ManyToOne(() => PropertyEntity, (property) => property.id)
  @JoinColumn()
    property: PropertyEntity;

  @Column({ nullable: true, default: null })
    address?: string;

  @Column({ nullable: true, default: null })
    depositAddress?: string;

  @Column({ nullable: true, default: null })
    merchantWalletId?: string;

  @Column({ nullable: true, default: null })
    merchantId?: string;

  @Column()
    createDate: string;

  @Column()
    updateDate: string;

  @Column({ nullable: true, default: null })
    expiresOn?: string;

  @Column({ nullable: true, default: null })
    hash?: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Started,
  })
    status?: Status;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn()
    user?: UserEntity;

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;

  @DeleteDateColumn({ nullable: true, default: null })
    deletedAt?: Date | null;
}
