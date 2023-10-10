import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'

import { Pod } from '@/database/entity'
import { SnapshotSupportedTypes } from '@/types'

@Entity()
export class ValueQuestion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  // Not unique because
  // 1. Have multiple questions for the same topic
  // 2. Have same topic for multiple pods
  @Column('varchar')
  topic: string

  // Not unique because
  // 1. Have multiple questions for the same topic
  // 2. Have same topic for multiple pods
  @Column('text')
  question: string

  @Column({
    type: 'text',
    nullable: true
  })
  note: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @ManyToOne((type) => Pod, (pod) => pod.valueQuestion)
  pod: Pod

  @Column('boolean')
  isActive: boolean // is value topic actively displayed to the pod

  // Snapshot Proposal

  // If nullable, snapshot proposal is not ready yet
  @Column('varchar', { nullable: true })
  snapshotId: string

  @Column({
    type: 'enum',
    enum: ['quadratic', 'weighted', 'ranked-choice'],
    default: 'quadratic'
  })
  snapshotType: SnapshotSupportedTypes

  @Column('varchar', { nullable: true })
  snapshotSpace: string

  @Column('timestamp', { nullable: true })
  snapshotStartDate: Date

  @Column('timestamp', { nullable: true })
  snapshotEndDate: Date

  @Column('varchar', { array: true, nullable: true })
  snapshotChoices: string[]
}
