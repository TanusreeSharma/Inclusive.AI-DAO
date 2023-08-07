import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'

import { User } from '@/database/entity'

@Entity()
export class PodTeam extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar')
  name: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: number

  @OneToMany((type) => User, (user) => user.podTeam)
  user: User[]

  @Column('boolean')
  isActive: boolean
}
