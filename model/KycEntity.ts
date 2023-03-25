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
import UserEntity from './UserEntity';

type ReviewResult = {
  moderationComment?: string;
  clientComment?: string;
  reviewAnswer: string;
  rejectLabels?: string[];
  reviewRejectType?: string;
};

/**
 * Example model entity.
 */
@Entity()
export default class KycEntity extends BaseEntity {
  @PrimaryColumn('uuid')
    id: string;

  @Column()
    applicantId: string;

  @Column()
    inspectionId: string;

  @Column()
    correlationId: string;

  @Column()
    levelName: string;

  @Column({ nullable: true, default: null })
    applicantType?: string;

  @OneToOne(() => UserEntity)
  @JoinColumn()
    user: UserEntity;

  @Column()
    externalUserId: string;

  @Column()
    type: string;

  @Column({ nullable: true, default: null })
    sandboxMode?: boolean;

  @Column()
    reviewStatus: string;

  @Column({
    type: 'text',
    transformer: {
      to(input: ReviewResult) {
        return JSON.stringify(input);
      },
      from(output: string) {
        return JSON.parse(output);
      },
    },
    nullable: true,
    default: null,
  })
    reviewResult?: ReviewResult;

  @Column()
    createdAt: string;

  @Column({ nullable: true, default: null })
    clientId?: string;

  @CreateDateColumn()
    createdAtLocal: Date;

  @UpdateDateColumn()
    updatedAt: Date;

  @DeleteDateColumn({ nullable: true, default: null })
    deletedAt?: Date | null;
}
