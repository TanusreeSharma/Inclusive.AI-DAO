//
// From https://github.com/Thream/socketio-jwt
//

import type { Algorithm, JwtPayload } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import type { Socket } from 'socket.io'

export class UnauthorizedError extends Error {
  public inner: { message: string }
  public data: { message: string; code: string; type: 'UnauthorizedError' }

  constructor(code: string, error: { message: string }) {
    super(error.message)
    this.name = 'UnauthorizedError'
    this.inner = error
    this.data = {
      message: this.message,
      code,
      type: 'UnauthorizedError'
    }
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

export const isUnauthorizedError = (error: unknown): error is UnauthorizedError => {
  return (
    typeof error === 'object' &&
    error != null &&
    'data' in error &&
    typeof error.data === 'object' &&
    error.data != null &&
    'type' in error.data &&
    error.data.type === 'UnauthorizedError'
  )
}

interface ExtendedSocket extends Socket {
  encodedToken?: string
  decodedToken?: any
  user?: any
}

type SocketIOJwtMiddleware = (socket: ExtendedSocket, next: (error?: UnauthorizedError) => void) => void

interface CompleteDecodedToken {
  header: {
    alg: Algorithm
    [key: string]: any
  }
  payload: any
}

type SecretCallback = (decodedToken: CompleteDecodedToken) => Promise<string> | string

export interface AuthorizeOptions {
  secret: string | SecretCallback
  algorithms?: Algorithm[]
  onAuthentication?: (decodedToken: any) => Promise<any> | any
}

export const jwtAuthorize = (options: AuthorizeOptions): SocketIOJwtMiddleware => {
  const { secret, algorithms = ['HS256'], onAuthentication } = options
  return async (socket, next) => {
    let encodedToken: string | null = null
    const { token } = socket.handshake.auth

    if (token != null) {
      const tokenSplitted = token.split(' ')
      if (tokenSplitted.length !== 2 || tokenSplitted[0] !== 'Bearer') {
        return next(
          new UnauthorizedError('credentials_bad_format', {
            message: 'Format is Authorization: Bearer [token]'
          })
        )
      }
      encodedToken = tokenSplitted[1]
    }

    if (encodedToken == null) {
      return next(
        new UnauthorizedError('credentials_required', {
          message: 'no token provided'
        })
      )
    }

    // socket.encodedToken = encodedToken

    let keySecret: string | null = null
    let decodedToken: JwtPayload | string = null

    if (typeof secret === 'string') {
      keySecret = secret
    } else {
      const completeDecodedToken = jwt.decode(encodedToken, { complete: true })
      keySecret = await secret(completeDecodedToken as CompleteDecodedToken)
    }
    try {
      decodedToken = jwt.verify(encodedToken, keySecret, { algorithms })
    } catch (err) {
      // console.log(err)
      return next(
        new UnauthorizedError('invalid_token', {
          message: 'Unauthorized: Token is missing or invalid Bearer'
        })
      )
    }

    // TODO: Deal with `string` type of decodedToken
    socket.data._decodedToken = decodedToken as JwtPayload

    if (onAuthentication != null) {
      try {
        socket.user = await onAuthentication(decodedToken)
      } catch (error: any) {
        return next(error)
      }
    }

    return next()
  }
}
