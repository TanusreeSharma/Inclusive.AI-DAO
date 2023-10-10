import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from 'typeorm'

import { Chat, Pod, Profile, Survey } from '@/database/entity'

export type UserRole = 'admin' | 'observer' | 'participant'

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn('varchar')
  id: string

  @Column('varchar')
  name: string

  // app-specific pub key
  @Column('varchar')
  appPubkey: string

  // on-chain address
  @Column('varchar')
  address: string

  // Prolific ID
  @Column('varchar', { nullable: true })
  prolificId: string

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date

  @Column({
    type: 'enum',
    enum: ['admin', 'observer', 'participant'],
    default: 'participant'
  })
  role: UserRole

  @OneToOne((type) => Profile, (profile) => profile.user)
  profile: Profile

  @OneToMany((type) => Chat, (chat) => chat.user)
  chats: Chat[]

  @OneToMany((type) => Survey, (survey) => survey.user)
  surveys: Survey[]

  @ManyToOne((type) => Pod, (pod) => pod.user)
  pod?: Pod

  // block number of receiving voting token
  @Column('int', { nullable: true })
  votingTokenReceivedBlockNumber: number

  // is the user part of the "early register" voting group
  @Column('boolean', { default: false })
  votingEarly: boolean

  // Has completed the Likert scale survey after AI-user discussion?
  @Column('boolean', { default: false })
  aiSurveyCompleted: boolean

  // static async getUserChats(userId: string) {
  //   // this = AppDataSource.getRepository(User)
  //   return this.createQueryBuilder("user")
  //     .innerJoinAndSelect('user.chats', 'chat')
  //     .where("user.id = :userId", { userId })
  //     .getMany()
  // }
}
