import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import CardPaymentEntity from './CardPaymentEntity';
import PaymentEntity, { Status } from './PaymentEntity';
import PropertyEntity from './PropertyEntity';
import UserEntity from './UserEntity';
export enum TransactionType {
  Buy = 'BUY',
  Sell = 'SELL',
}
/**
 * Example model entity.
 */
@Entity()
export default class TransactionEntity extends BaseEntity {
  @PrimaryColumn('uuid')
    id: string;

  @ManyToOne(() => PropertyEntity, (property) => property.id)
  @JoinColumn()
    property?: PropertyEntity;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn()
    user?: UserEntity;

  @Column()
    tokens: number;

  @Column()
    amount: number;

  @Column()
    amountType: string;

  @OneToOne(() => PaymentEntity)
  @JoinColumn()
    payment?: PaymentEntity;

  @OneToOne(() => CardPaymentEntity)
  @JoinColumn()
    cardPayment?: CardPaymentEntity;

  @Column({ nullable: true, default: null })
    hash?: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Started,
  })
    paymentStatus?: Status;

  @Column()
    type?: TransactionType;

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;

  @DeleteDateColumn({ nullable: true, default: null })
    deletedAt?: Date | null;
}
