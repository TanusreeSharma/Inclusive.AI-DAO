import { Request as ExpressRequest } from 'express'
import * as jose from 'jose'
import httpStatus from 'http-status'
import { Strategy as CustomStrategy } from 'passport-custom'

import { JWKS_URL } from '@/config'
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
    //
    // For some reason, req.body is only available if @Body() or @Body({ required: true } is set in controller routes
    //

    console.log(req.query, req.params, req.body)

    // `appPubkey` passed in from the frontend Web3Auth in the request param or body
    let appPubkey = undefined
    if (req.method === 'GET') appPubkey = req.params?.appPubkey || req.query?.appPubkey
    else if (req.method === 'POST') appPubkey = req.body?.appPubkey

    if (!appPubkey) throw new ApiError(httpStatus.BAD_REQUEST, 'Missing parameter `appPubkey`')

    // Retrieve Bearer Token from Headers (ie. Authorization: 'Bearer {token}')
    let idToken: string = ''
    try {
      idToken = getBearerTokenFromHeaders(req) // Web3Auth JWT (`idToken` on frontend)
      if (!idToken) throw new Error('') // caught below & formatted
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid bearer token')
    }

    // Get the JWK set used to sign the JWT issued by Web3Auth (that uses openlogin) (one-time)
    // TODO: cache this JWT returned from the API to avoid calling this API every time
    //      => Question: Does `jose` package cache this for us already?
    const appJwks = jose.createRemoteJWKSet(new URL(JWKS_URL))

    // Verify the JWT using Web3Auth's JWKS
    let jwtDecoded: jose.JWTVerifyResult & jose.ResolvedKey<jose.KeyLike>
    try {
      jwtDecoded = await jose.jwtVerify(idToken, appJwks, { algorithms: ['ES256'] }) // issuer: 'https://openlogin.com'
    } catch (err) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid jwt')
    }

    // Checking `appPubkey` against the decoded JWT wallet's public_key
    // (note `wallet` type (for Web3Auth) is not in the `jose` package, so we use `any`)
    const payload = jwtDecoded.payload as any
    if (payload.wallets[0].public_key === appPubkey && payload.iss === 'https://api.openlogin.com') {
      const userId =
        (jwtDecoded.payload.email as string) || (jwtDecoded.payload.verifierId as string) || jwtDecoded.payload.sub
      callback(null, userId)
    } else {
      // Not verified (need to be in else so that it's not called if `if` condition is met)
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid user credentials')
    }
  } catch (e) {
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
