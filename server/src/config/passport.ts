import { Request as ExpressRequest } from 'express'
import * as jose from 'jose'
import httpStatus from 'http-status'
import { Strategy as CustomStrategy } from 'passport-custom'

import { ApiError } from '@/utils'

// Extract Bearer token from req.header
// NOTE: Express makes everything lowercase (authorization, but NOT `Bearer`)
function getBearerTokenFromHeaders(req: ExpressRequest) {
  const authHeader = req.headers.authorization

  if (!authHeader) throw new ApiError(httpStatus.BAD_REQUEST, 'Missing authorization header')
  if (!authHeader.startsWith('Bearer ')) throw new ApiError(httpStatus.BAD_REQUEST, 'Missing bearer token')

  const jwtToken = authHeader.substring(7, authHeader.length)
  if (jwtToken.trim() === '') throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid bearer token')

  return jwtToken
}

type JwtResParamOrBody = {
  appPubkey?: string
}

// https://web3auth.io/docs/pnp/features/server-side-verification/social-login-users
const jwtStrategyFunction = async (
  req: ExpressRequest<JwtResParamOrBody, {}, JwtResParamOrBody>,
  callback: (err: ApiError, user: string) => any
) => {
  try {
    // Passed from the frontend Web3Auth in the request param or body
    console.log(req.params, req.body)
    if (!req.params.appPubkey && !req.body.appPubkey) throw new ApiError(httpStatus.BAD_REQUEST, 'Missing appPubkey')
    const { appPubkey } = req.body || req.params

    const idToken = getBearerTokenFromHeaders(req) // Web3Auth JWT (`idToken` on frontend)

    // Get the JWK set used to sign the JWT issued by Web3Auth
    const jwks = jose.createRemoteJWKSet(new URL('https://api.openlogin.com/jwks'))

    // Verify the JWT using Web3Auth's JWKS
    const jwtDecoded = await jose.jwtVerify(idToken, jwks, { algorithms: ['ES256'] })
    console.log(jwtDecoded)

    // Checking `appPubkey` against the decoded JWT wallet's public_key
    // (note `wallet` type (for Web3Auth) is not in the `jose` package, so we use `any`)
    const payload = jwtDecoded.payload as any
    if (payload.wallets[0].public_key === appPubkey && payload.iss === 'https://api.openlogin.com') {
      const userId =
        (jwtDecoded.payload.email as string) || (jwtDecoded.payload.verifierId as string) || jwtDecoded.payload.sub
      callback(null, userId)
    } else {
      // Not verified (need to be in else so that it's not called if `if` condition is met)
      callback(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid user credentials'), null)
    }
  } catch (e) {
    // console.log(e);
    if (e instanceof ApiError) {
      //  || e instanceof jwt.JsonWebTokenError || e instanceof jwt.NotBeforeError || e instanceof jwt.TokenExpiredError
      callback(e, null)
    } else {
      console.log(e)
      callback(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error'), null)
    }
  }
}

const jwtStrategy = new CustomStrategy(jwtStrategyFunction)

export { jwtStrategy }
