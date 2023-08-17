import {
  Authorized,
  Param,
  Body,
  Get,
  JsonController,
  Post,
  Put,
  SessionParam,
  UseAfter,
  UseBefore,
  CurrentUser
} from 'routing-controllers'

import AppDataSource from '@/database/data-source'
import { Pod, Profile, User, ValueQuestion } from '@/database/entity'
import { UserRole } from '@/database/entity/User'
// import { FinalSayMiddleware } from '@/middleware'
import { CreateUserProfileParams } from '@/types'
import { staticAssignUserToPod } from '@/utils'

type UserRegisterParams = {
  id: string
  name: string
  role: UserRole
}

@JsonController('/user')
@Authorized()
// @UseAfter(FinalSayMiddleware)
export default class UserController {
  @Get('/profile') // GET '/user/profile'
  async getUserProfile(@CurrentUser({ required: true }) user: User) {
    const profile = await AppDataSource.getRepository(Profile)
      .createQueryBuilder('profile')
      .where('profile.userId = :userId', { userId: user.id })
      .getOne()
      .catch((err) => {
        if (typeof err?.detail === 'string' && err.detail.includes('does not exist')) {
          return { is: 'does not exist' }
        }
        return { is: 'errored' }
      })

    if (!profile) return { is: 'not found' }
    return {
      user,
      ...profile
    }
  }

  @Post('/profile') // POST '/user/profile'
  async createUserProfile(@Body({ required: true }) body: Omit<CreateUserProfileParams, 'user'> & { userId: string }) {
    const newProfileData = body as Omit<CreateUserProfileParams, 'appPubkey'> & { userId: string }

    // First check that user exists
    const user = await AppDataSource.getRepository(User)
      .createQueryBuilder('user')
      .where('user.id = :id', { id: body.userId })
      .getOne()

    if (!user) return { is: 'user does not exist' }

    let ret = { is: 'profile not added' }
    try {
      await Profile.createProfileForUser(newProfileData)
      ret = { is: 'profile added' }
    } catch (err: any) {
      console.log(err)
      if (typeof err?.detail === 'string' && err.detail.includes('already exists')) {
        ret = { is: 'profile exists' }
      }
    }

    if (ret.is === 'profile added') {
      await staticAssignUserToPod(body.userId)
    }

    return ret
  }

  @Post('/register') // POST '/user/register'
  async userRegister(@Param('user') userId: string, @Body({ required: true }) body: UserRegisterParams) {
    // console.log(userId)
    try {
      await AppDataSource.createQueryBuilder()
        .insert()
        .into(User)
        .values([
          {
            id: userId,
            name: body.name,
            role: body.role
          }
        ])
        .execute()
      return { is: 'registered' }
    } catch (err: any) {
      console.log(err)
      if (typeof err?.detail === 'string' && err.detail.includes('already exists')) {
        return { is: 'already registered' }
      }
      return { is: 'not registered' }
    }
    // return { is: 'registered' }
  }

  @Get('/pod') // GET '/user/pod'
  async getUserPod(@CurrentUser({ required: true }) user: User) {
    const pod = await AppDataSource.getRepository(Pod)
      .createQueryBuilder('pod')
      // .leftJoin('pod.podTeam', 'podTeam')
      .leftJoinAndSelect('pod.valueQuestion', 'valueQuestion') // implict 3rd arg: 'pod.id = valueQuestion.pod'
      .leftJoin('pod.user', 'user') // don't select (NEED for `where` clause below)
      .where('user.id = :userId', { userId: user.id })
      .getOne()
      .catch((err) => {
        if (typeof err?.detail === 'string' && err.detail.includes('does not exist')) {
          return { is: 'does not exist' }
        }
        return { is: 'errored' }
      })

    console.log(pod)
    if (!pod) return { is: 'not found' }
    return pod
  }

  // @Get('/users/:id')
  // getOne(@Param('id') id: number) {
  //   return 'This action returns user #' + id
  // }
  // @Post('/users')
  // post(@Body() user: any) {
  //   return 'Saving user...'
  // }
  // @Put('/users/:id')
  // put(@Param('id') id: number, @Body() user: any) {
  //   return 'Updating a user...'
  // }
  // @Delete('/users/:id')
  // remove(@Param('id') id: number) {
  //   return 'Removing user...'
  // }
}
