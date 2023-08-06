import { BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm'

import { Chat, Profile, Survey } from '@/database/entity'

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column()
  name: string

  @Column()
  role: string

  @OneToOne((type) => Profile, (profile) => profile.user)
  profile: Profile

  @OneToMany((type) => Chat, (chat) => chat.user)
  chats: Chat[]

  @OneToMany((type) => Survey, (survey) => survey.user)
  surveys: Survey[]

  // static async getUserChats(userId: string) {
  //   // this = AppDataSource.getRepository(User)
  //   return this.createQueryBuilder("user")
  //     .innerJoinAndSelect('user.chats', 'chat')
  //     .where("user.id = :userId", { userId })
  //     .getMany()
  // }
}
