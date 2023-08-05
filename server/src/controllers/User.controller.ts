import { JsonController, Authorized, Param, Body, Get, Post, Put, UseAfter } from 'routing-controllers'

import { FinalSay } from '@/middleware'

@JsonController()
@Authorized()
@UseAfter(FinalSay)
export default class UserController {
  // @Get('/users')
  // getAll() {
  //   return 'This action returns all users'
  // }
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
