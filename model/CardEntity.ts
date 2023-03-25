import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 * Example model entity.
 */
@Entity()
export default class CardEntity extends BaseEntity {
  @PrimaryColumn('uuid')
    id: string;

  @Column()
    cardId: string;

  @Column()
    status: string;

  @Column()
    last4: string;

  @Column('simple-json')
    billingDetails: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    district?: string;
    country: string;
  };

  @Column()
    expMonth: number;

  @Column()
    expYear: number;

  @Column()
    network: string;

  @Column()
    bin: string;

  @Column()
    issuerCountry?: string;

  @Column()
    fundingType: string;

  @Column()
    fingerprint: string;

  @Column('simple-json')
    verification: {
    cvv: string;
    avs: string;
  };

  @Column()
    createDate: string;

  @Column('simple-json')
    metadata: {
    phoneNumber?: string;
    email: string;
  };

  @Column()
    updateDate: string;

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;

  @DeleteDateColumn({ nullable: true, default: null })
    deletedAt?: Date | null;
}
