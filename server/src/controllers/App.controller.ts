import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers'

@Controller()
export class AppController {
  @Get('/ping')
  ping() {
    return 'pong'
  }
}
