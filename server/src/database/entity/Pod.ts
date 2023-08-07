import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'

import { User } from '@/database/entity'

@Entity()
export class Pod extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar')
  name: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: number

  @OneToMany((type) => User, (user) => user.pod)
  user: User[]

  @Column('boolean')
  isActive: boolean
}
