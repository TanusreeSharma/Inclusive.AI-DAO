import * as crypto from 'crypto'

export * from './assign-pod'
export * from './assign-profile-pics'
export * from './assign-snapshot'
export * from './assign-vote-power'
export * from './snapshot'

export class ApiError extends Error {
  statusCode: number // using http-status
  isOperational: boolean

  constructor(statusCode: number, message: any, isOperational = true, stack = '') {
    super(message)
    this.statusCode = typeof statusCode === 'number' ? statusCode : 500
    this.isOperational = isOperational
    if (stack) this.stack = stack
    else Error.captureStackTrace(this, this.constructor)
  }
}

const isObject = (o: any) => o && typeof o === 'object' && o.constructor === Object
const isDictionary = (d: any) => isObject(d) && !Array.isArray(d)

// Deep merge objects (into a clone)
export function deepExtend(...extend: any[]) {
  let end = {}
  for (const val of extend) {
    if (isDictionary(val)) {
      // contains dictionary
      if (!isObject(end)) end = {} // change end to {} if end is not object
      for (const k in val) end[k] = deepExtend(end[k], val[k]) // loops through all nested objects
    } else end = val
  }
  return end
}

export const sha256 = (msg: string) =>
  crypto.createHash('sha256').update(msg).digest('hex')
