import KycEntity from './KycEntity';
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
  OneToMany,
} from 'typeorm';
import BalanceEntity from './BalanceEntity';

/**
 * Example model entity.
 */
@Entity()
export default class UserEntity extends BaseEntity {
  @PrimaryColumn('uuid')
    id: string;

  @Column({ unique: true })
    email: string;

  @Column()
    password: string;

  @OneToOne(() => KycEntity)
  @JoinColumn()
    kyc?: KycEntity;

  @OneToMany(() => BalanceEntity, (balance) => balance.user)
  @JoinColumn()
    balances?: BalanceEntity;

  @Column({ nullable: true, default: null })
    wallet: string;

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;

  @DeleteDateColumn({ nullable: true, default: null })
    deletedAt?: Date | null;
}
