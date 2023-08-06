import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Chat } from '@/database/entity'

@Entity()
export class AiResponse extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text')
  text: string

  @Column()
  channel: string

  @Column('datetime')
  created: number

  @OneToOne((type) => Chat, (chat) => chat.aiResponse)
  @JoinColumn() // AiResponse owns the relationship, this column is foreign key
  chat: Chat
}
