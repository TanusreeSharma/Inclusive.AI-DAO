import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'

import { User } from '@/database/entity'

export enum LikertScaleAnswer {
  UNKNOWN, // default (unanswered or error - basically catch-all)
  STRONGLY_DISAGREE,
  DISAGREE,
  NEUTRAL,
  AGREE,
  STRONGLY_AGREE
}

@Entity()
export class Survey extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar')
  stage: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @ManyToOne((type) => User, (user) => user.surveys)
  // @JoinColumn() // Survey owns the relationship, this column is foreign key (for many-to-one, owner side is always many-to-one)
  user: User

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q1A: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q1B: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q1C: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q1D: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q1E: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q1F: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q1G: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q2A: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q2B: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q2C: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q2D: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q2E: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q2F: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q2G: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q2H: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q2I: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q2J: LikertScaleAnswer

  @Column({ type: 'enum', enum: LikertScaleAnswer, default: LikertScaleAnswer.UNKNOWN })
  q2K: LikertScaleAnswer

  // Attention check questions
  @Column({ type: 'text', default: '' })
  attention1: string
}
