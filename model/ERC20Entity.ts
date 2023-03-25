import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import BalanceEntity from './BalanceEntity';
import PropertyEntity from './PropertyEntity';

/**
 * Example model entity.
 */
@Entity()
export default class ERC20Entity extends BaseEntity {
  @PrimaryColumn('uuid')
    id: string;

  @Column()
    contractAddress: string;

  @Column()
    deployerId: string;

  @Column()
    supply: number;

  @Column({ nullable: true, default: null })
    currentSupply: number;

  @Column({ nullable: true, default: null })
    reserveSupply: number;

  @Column()
    bankAccount: string;

  @OneToOne(() => PropertyEntity)
  @JoinColumn()
    property?: PropertyEntity;

  @OneToMany(() => BalanceEntity, (balance) => balance.erc20)
  @JoinColumn()
    balances?: BalanceEntity[];

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;

  @DeleteDateColumn({ nullable: true, default: null })
    deletedAt?: Date | null;
}
