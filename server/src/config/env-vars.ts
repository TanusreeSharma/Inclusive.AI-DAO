import Joi from 'joi'
import * as path from 'node:path'

require('dotenv').config({ path: path.join(__dirname, '../../.env') })

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'local', 'test').required(),
    PORT: Joi.number().default(8080),

    OPENAI_API_KEY: Joi.string().required().description('OpenAI API key'),

    PRIMARY_REGION: Joi.string().required().description('Primary region'),
    FLY_REGION: Joi.string().required().description('Fly region'),
    DATABASE_URL: Joi.string().required().description('PostgreSQL db url'),
    // POSTGRES_HOST: Joi.string().required().description('PostgreSQL db host'), // .default('localhost'),
    // POSTGRES_USER: Joi.string().required().description('PostgreSQL db user'), // .default('postgres'),
    // POSTGRES_PASSWORD: Joi.string().required().description('PostgreSQL db user password'),
    // POSTGRES_DB: Joi.string().required().description('PostgreSQL db name to connect'),
    // POSTGRES_PORT: Joi.number().default(5432).description('PostgreSQL db port, default 5432'),

    REDIS_URL_SEA: Joi.string().optional().description('Redis URL'),
    REDIS_URL_SJC: Joi.string().optional().description('Redis URL'),
    REDIS_URL_DEN: Joi.string().optional().description('Redis URL'),
    REDIS_URL_IAD: Joi.string().optional().description('Redis URL'),

    CONSIDER_USERS_AFTER_DATE: Joi.string().required().description('Datetime to consider users after'),

    JWT_RANDOM_SECRET: Joi.string().required().description('SHA512 for jwt'),

    CLOUDINARY_KEY: Joi.string().required().description('Cloudinary key'),
    CLOUDINARY_SECRET: Joi.string().required().description('Cloudinary secret'),

    TOKEN_DEPLOYER_PRIVATE_KEY: Joi.string().required().description('Private key of token deployer'),
    // DOMAIN_OWNER_PRIVATE_KEY: Joi.string().required().description('Private key of domain owner'),
    OPTIMISM_RPC_URL: Joi.string().default('https://rpc.ankr.com/optimism').description('Optimism RPC URL'),

    DROP_SCHEMA: Joi.string().default('false').description('Drop schema on start'),
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
