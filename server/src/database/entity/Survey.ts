import { BaseEntity, Column, Entity, JoinColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'

import { User } from '@/database/entity'

@Entity()
export class Survey extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text')
  text: string

  @Column('int')
  stage: number

  @Column('datetime')
  created: number

  @ManyToOne((type) => User, (user) => user.surveys)
  // @JoinColumn() // Survey owns the relationship, this column is foreign key (for many-to-one, owner side is always many-to-one)
  user: User
}
