import { BaseEntity, Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from 'typeorm'

import { Chat, Pod, PodTeam, Profile, Survey } from '@/database/entity'

export type UserRole = 'admin' | 'observer' | 'participant'

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column()
  name: string

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

  @ManyToOne((type) => PodTeam, (podTeam) => podTeam.user)
  podTeam?: PodTeam

  // static async getUserChats(userId: string) {
  //   // this = AppDataSource.getRepository(User)
  //   return this.createQueryBuilder("user")
  //     .innerJoinAndSelect('user.chats', 'chat')
  //     .where("user.id = :userId", { userId })
  //     .getMany()
  // }
}
