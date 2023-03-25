import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import {
  PaymentVerificationResponse,
  MetadataPhoneEmail,
  SourceResponse,
} from '@circle-fin/circle-sdk';
import PropertyEntity from './PropertyEntity';
import UserEntity from './UserEntity';

/**
 * Example model entity.
 */
@Entity()
export default class CardPaymentEntity extends BaseEntity {
  @PrimaryColumn('uuid')
    id: string;

  @Column() // TODO probably paymentIntentId
    paymentId?: string;

  @ManyToOne(() => PropertyEntity, (property) => property.id)
  @JoinColumn()
    property: PropertyEntity;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn()
    user: UserEntity;

  @Column('simple-json')
    metadata: MetadataPhoneEmail;

  @Column('simple-json')
    amount: { currency: 'USD'; amount: string };

  @Column({ nullable: true, default: null })
    autoCapture?: boolean;

  @Column('simple-json')
    source: SourceResponse;

  @Column({ nullable: true, default: null })
    keyId?: string;

  @Column('simple-json', { nullable: true, default: null })
    verification?: PaymentVerificationResponse;

  @Column({ nullable: true, default: null })
    idempotencyKey: string;

  @Column({ nullable: true, default: null })
    verificationSuccessUrl?: string;

  @Column({ nullable: true, default: null })
    verificationFailureUrl?: string;

  @Column()
    description: string;

  @Column({ nullable: true, default: null })
    encryptedData?: string;

  @Column({ nullable: true, default: false })
    confirmed?: boolean;

  @Column({ nullable: true, default: false })
    channel?: string;

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;

  @DeleteDateColumn({ nullable: true, default: null })
    deletedAt?: Date | null;
}
