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
import ERC20Entity from './ERC20Entity';
import UserEntity from './UserEntity';

/**
 * Example model entity.
 */
@Entity()
export default class BalanceEntity extends BaseEntity {
  @PrimaryColumn('uuid')
    id: string;

  @Column()
    tokens: string;

  @Column()
    type: string;

  @Column({ nullable: true, default: null })
    paymentId: string;

  @Column({ nullable: true, default: null })
    account?: string;

  // Trasfer on erc20 was executed
  @Column({ nullable: true, default: null })
    confirmed?: boolean;

  // Trasfer on erc20 was result hash
  @Column({ nullable: true, default: null })
    hash?: string;

  @Column()
    investment: string;

  @Column()
    dolars: string;

  @ManyToOne(() => UserEntity, (user) => user.balances)
  @JoinColumn()
    user?: UserEntity;

  @ManyToOne(() => ERC20Entity, (erc20) => erc20.balances)
    erc20?: ERC20Entity;

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;

  @DeleteDateColumn({ nullable: true, default: null })
    deletedAt?: Date | null;
}
