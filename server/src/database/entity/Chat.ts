import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

import { AiResponse, User } from '@/database/entity'

@Entity()
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text')
  text: string

  @Column('varchar') // user's connection id, e.g. sha256(user_email + chat_location)
  connection: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  // ID that this message is replying to
  @Column('integer', { nullable: true })
  replyTo: number

  // Hide this message
  @Column('boolean', { default: false })
  hidden: boolean

  // Message is flagged for content
  @Column('boolean', { default: false })
  flagged: boolean

  @ManyToOne((type) => User, (user) => user.chats)
  // @JoinColumn() // Chat owns the relationship, this column is foreign key (for many-to-one, owner side is always many-to-one)
  user: User

  @OneToOne((type) => AiResponse, (aiRes) => aiRes.chat)
  aiResponse: AiResponse

  static async getChatsByUserId(userId: string) {
    // this = AppDataSource.getRepository(Chat)
    return this.createQueryBuilder('chat').where('user = :userId', { userId }).getMany()
  }
}
