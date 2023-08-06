import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import passport from 'passport'
import { ExpressMiddlewareInterface } from 'routing-controllers'

import { ApiError } from '@/utils'

/**
 * Final middleware before sending response to user
 */
export class JwtAuthMiddleware implements ExpressMiddlewareInterface {
  use(req: ExpressRequest, res: ExpressResponse, next?: (err?: any) => any): any {
    return new Promise<boolean>((resolve, reject) => {
      passport.authenticate('jwt', (err: ApiError, user: string) => {
        if (err) return next({ error: err.message, status: err.statusCode })
        if (!user) return next({ error: 'Invalid user', status: 401 })

        // req.user = user // pass `user` data to further controller
        req.params.user = user // pass `user` data to further controller
        return next()
      })(req, res, next)
    })
  }
}
