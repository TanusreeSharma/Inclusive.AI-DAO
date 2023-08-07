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
import { Profile, User } from '@/database/entity'
import { UserRole } from '@/database/entity/User'
// import { FinalSayMiddleware } from '@/middleware'
import { CreateUserProfileParams } from '@/types'

type RegisterUserParams = {
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
      .where('profile.user = :userId', { userId: user.id })
      .getOne()
      .catch((err) => {
        if (typeof err?.detail === 'string' && err.detail.includes('does not exist')) {
          return { is: 'does not exist' }
        }
        return { is: 'errored' }
      })

    if (!profile) return { is: 'not found' }
    return profile
  }

  @Post('/profile') // POST '/user/profile'
  createUserProfile(@Body({ required: true }) body: CreateUserProfileParams) {
    return 'This action returns all users'
  }

  @Post('/register') // POST '/user/register'
  async registerUser(@Param('user') userId: string, @Body({ required: true }) body: RegisterUserParams) {
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
      if (typeof err?.detail === 'string' && err.detail.includes('already exists')) {
        return { is: 'already registered' }
      }
      return { is: 'not registered' }
    }
    // return { is: 'registered' }
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
