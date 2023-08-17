import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'

import { PodTeam, User, ValueQuestion } from '@/database/entity'

@Entity()
export class Pod extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'varchar',
    unique: true
  })
  slug: string

  @Column('varchar')
  name: string

  @Column('text')
  description: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: number

  // A Pod has many users in it
  @OneToMany((type) => User, (user) => user.pod)
  user: User[]

  // A Pod has many teams associated
  @OneToMany((type) => PodTeam, (podTeam) => podTeam.pod)
  podTeam: PodTeam[]

  // A Pod has many Value Topics associated
  @OneToMany((type) => ValueQuestion, (valueQuestion) => valueQuestion.pod)
  valueQuestion: ValueQuestion[]

  @Column('boolean')
  isActive: boolean
}
