import morgan from 'morgan'
import chalk from 'chalk'

const MorganLoggerMiddleware = morgan(function (tokens, req, res) {
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

export default MorganLoggerMiddleware
