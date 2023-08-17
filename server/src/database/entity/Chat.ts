import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

import { AiResponse, User } from '@/database/entity'

@Entity()
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text')
  text: string

  @Column()
  channel: string

  @Column() // user's connection id
  connection: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

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
