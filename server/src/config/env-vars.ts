import Joi from 'joi'
import * as path from 'path'

require('dotenv').config({ path: path.join(__dirname, '../../.env') })

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(8080),

    OPENAI_API_KEY: Joi.string().required().description('OpenAI API key'),

    // POSTGRES_HOST: Joi.string().required().default('localhost'),
    // POSTGRES_USER: Joi.string().required().default('postgres'),
    // POSTGRES_PASSWORD: Joi.string().required(),
    // POSTGRES_DB: Joi.string().required().description('Database name to connect'),

    JWT_RANDOM_SECRET: Joi.string().required().description('SHA512 for jwt')
  })
  .unknown()

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

export default envVars

// module.exports = {
//   NODE_ENV: envVars.NODE_ENV,
//   port: envVars.PORT,

// postgres: {
//   host: envVars.POSTGRES_HOST,
//   user: envVars.POSTGRES_USER,
//   password: envVars.POSTGRES_PASSWORD,
//   dbname: envVars.POSTGRES_DB,
//   dialect: 'postgres',
//   sequelize_port: 5432,
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// },

// jwt: {
//   issuer: 'https://',
// },

// cookieSecret: envVars.COOKIE_SECRET,
// }
