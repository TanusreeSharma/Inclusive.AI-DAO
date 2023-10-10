import { Algorithm } from 'jsonwebtoken'

export const JWKS_URL = 'https://api.openlogin.com/jwks' // https://sandrino.auth0.com/.well-known/jwks.json
// export const JWKS_WEB3AUTH_URL = 'https://authjs.web3auth.io/jwks'

export const JWKS_ALGORITHMS: Algorithm[] = ['ES256', 'RS256']

export const TOKEN_ADDR_INCLQ = '0x4dAE977efb94843837E932cedCB689E338288e6e'

export const TOKEN_ADDR_INCLR = '0x3F6bb31823d4c0Fc62EDFae43f76a31c32017244'