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
  UseBefore
} from 'routing-controllers'

import { FinalSayMiddleware, JwtAuthMiddleware } from '@/middleware'
import AppDataSource from '@/database/data-source'
import { Profile } from '@/database/entity'

@JsonController('/user')
@Authorized()
// @UseAfter(FinalSayMiddleware)
export default class UserController {
  @Get('/profile') // GET '/user/profile'
  @UseBefore(JwtAuthMiddleware)
  getUserProfile(@Param('user') user: string) {
    return AppDataSource.getRepository(Profile)
      .createQueryBuilder("profile")
      .where("profile.user = :userId", { userId: user })
  }

  @Post('/profile') // POST '/user/profile'
  @UseBefore(JwtAuthMiddleware)
  createUserProfile(@Body() body: any) {
    return 'This action returns all users'
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
