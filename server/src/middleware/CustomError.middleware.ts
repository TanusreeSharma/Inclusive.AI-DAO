import { Middleware, ExpressErrorMiddlewareInterface, HttpError } from 'routing-controllers'

import { ApiError } from '@/utils'

@Middleware({ type: 'after' })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, request: any, response: any, next: (err?: any) => any) {
    console.log(error)
    // Make sure only one error is sent,
    // otherwise it will throw `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`
    if (error instanceof HttpError) {
      response.status(error.httpCode).json({ error: error.message, payload: null })
    } else if (error instanceof ApiError) {
      response.status(error.statusCode).json({ error: error.message, payload: null })
    } else if (error.status) {
      if (error.error) {
        response.status(error.status).json({ error: error.error, payload: null })
      } else {
        response.status(error.status).json({ error: 'error', payload: null })
      }
    } else {
      response.status(500).json({ error: 'Internal server error', payload: null })
    }
  }
}
