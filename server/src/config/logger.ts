import chalk from 'chalk'
import morgan from 'morgan'
import path from 'node:path'
import winston from 'winston'

import envVars from '@/config/env-vars'

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack })
  }
  return info
})

const srcDir = path.dirname(require.main.filename)
const logDir = path.join(srcDir, '../logs')

export const winstonLogger = winston.createLogger({
  level: envVars.NODE_ENV === 'local' ? 'debug' : 'info',
  format: winston.format.combine(
    // enumerateErrorFormat(),
    // envVars.NODE_ENV === 'local' ? winston.format.colorize() : winston.format.uncolorize(),
    // winston.format.splat(),
    // winston.format.printf(({ level, message }) => `${level}: ${message}`)
    //
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error']
    }),
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'info.log'), level: 'info' }),
    new winston.transports.File({ filename: path.join(logDir, 'debug.log'), level: 'debug' })
  ]
})

export const morganLogger = morgan(function (tokens, req, res) {
  return [
    chalk.hex('#f78fb3').bold('[' + tokens.date(req, res) + ']'),
    chalk.hex('#34ace0').bold(tokens.method(req, res)),
    chalk.hex('#ffb142').bold(tokens.status(req, res)),
    chalk.hex('#ff5252').bold(tokens.url(req, res)),
    chalk.hex('#2ed573').bold(tokens['response-time'](req, res) + 'ms'),
    chalk.yellow(tokens['remote-addr'](req, res)),
    chalk.hex('#fffa65').bold('FROM ' + (tokens.referrer(req, res) || 'DIRECT')),
    chalk.hex('#1e90ff')(tokens['user-agent'](req, res))
  ].join(' ')
})
