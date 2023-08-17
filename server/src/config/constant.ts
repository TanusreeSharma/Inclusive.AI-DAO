import { Algorithm } from 'jsonwebtoken'

export const JWKS_URL = 'https://api.openlogin.com/jwks' // https://sandrino.auth0.com/.well-known/jwks.json
// export const JWKS_WEB3AUTH_URL = 'https://authjs.web3auth.io/jwks'

export const JWKS_ALGORITHMS: Algorithm[] = ['ES256', 'RS256']
