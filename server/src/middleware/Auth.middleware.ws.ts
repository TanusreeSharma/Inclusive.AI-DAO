import { Middleware, MiddlewareInterface } from 'socket-controllers'

// Applies to all `/chat` routes
// @Middleware({ namespace: '/chat' })
@Middleware()
export default class AuthenticationMiddleware implements MiddlewareInterface {
  use(socket: any, next: (err?: any) => any): any {
    console.log('authentication...')
    next()
  }
}
