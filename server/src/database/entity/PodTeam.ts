import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm'

import { Pod, User } from '@/database/entity'

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

  @ManyToOne((type) => Pod, (pod) => pod.podTeam)
  pod: Pod

  @Column('boolean')
  isActive: boolean
}
