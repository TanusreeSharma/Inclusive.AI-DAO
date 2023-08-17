import { Middleware, ExpressErrorMiddlewareInterface, HttpError } from 'routing-controllers'

import { ApiError } from '@/utils'

@Middleware({ type: 'after' })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, request: any, response: any, next: (err?: any) => any) {
    console.log(error)
    if (error instanceof HttpError) {
      response.status(error.httpCode).json({ error: error.message })
    }

    if (error instanceof ApiError) {
      response.status(error.statusCode).json({ error: error.message })
    }

    next(error)
  }
}
