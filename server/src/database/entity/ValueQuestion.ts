import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'

import { Pod } from '@/database/entity'

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
  createdAt: number

  @ManyToOne((type) => Pod, (pod) => pod.valueQuestion)
  pod: Pod

  @Column('boolean')
  isActive: boolean // is value topic actively displayed to the pod
}
