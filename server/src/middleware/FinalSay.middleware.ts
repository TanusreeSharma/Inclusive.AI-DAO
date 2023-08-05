import { deepExtend } from '@/utils'
import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { ExpressMiddlewareInterface } from 'routing-controllers'

/**
 * Final middleware before sending response to user
 */
export default class FinalSayMiddleware implements ExpressMiddlewareInterface {
  use(req: ExpressRequest, res: ExpressResponse, next?: (err?: any) => any): any {
    try {
      // skip if route is invalid (goes to page error handler)
      if (!req.route) return next()

      // READ: http://expressjs.com/en/api.html#res.locals
      const passOn = res.locals

      // Unify response syntax
      const resJson = {
        error: null,
        status: 'success',
        msg: '',
        payload: {}
      }

      // check for error
      if (passOn.error) {
        resJson.error = passOn.error
        resJson.status = 'error'
      }

      // bump up `msg` if passed (and delete passOn.msg)
      if (passOn.msg) {
        resJson.msg = passOn.msg
        delete passOn.msg
      }

      // finally, deep extend (to copy everything from passOn to resJson.payload
      resJson.payload = deepExtend(resJson.payload, passOn)

      if (resJson.error) res.status(passOn.error.statusCode || 500).send(resJson)
      else res.status(200).send(resJson)
    } catch (err) {
      next(err)
    }
  }
}