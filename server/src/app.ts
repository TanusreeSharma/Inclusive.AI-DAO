import 'es6-shim'
import 'reflect-metadata' // make @decorators work properly (for `routing-controllers` and `typeorm`)

// import cors from 'cors'
import bodyParser from 'body-parser'
import compression from 'compression'
import express from 'express'
import { createServer } from 'http'
import path from 'path'
import passport from 'passport'
// import * as redis from 'redis'
import { Redis } from 'ioredis'
import { Action, useExpressServer } from 'routing-controllers'

import { envVars, jwtStrategy, morganLogger, winstonLogger } from '@/config'
import AppDataSource from '@/database/data-source'
import * as entities from '@/database/entity'
import { CustomErrorHandler } from '@/middleware'
import { createAndAttachSocketIo } from '@/socket'
import { ApiError } from '@/utils'

// Custom JWT strategy
passport.use('jwt', jwtStrategy)

//
// Set up express server with websocket enabled
// Need to use `useExpressServer` instead of `createExpressServer` to combine both routing-controllers and socket-controllers
//

let app = express()

// for parsing req.body
app.use(bodyParser.json())

useExpressServer(app, {
  cors: {
    // origin: '*',
    // origin: 'http://localhost:3000',
    origin: envVars.NODE_ENV === 'local' ? 'http://localhost:3000' : 'https://myinclusiveai.com',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true
  },
  controllers: [path.join(__dirname + '/controllers/*.controller.ts')],
  // middlewares: [path.join(__dirname + '/middleware/*.middleware.ts')],
  middlewares: [
    CustomErrorHandler
    // JwtAuthMiddleware,
  ],
  defaultErrorHandler: false, // use custom error handler
  // Authorization
  authorizationChecker: (action: Action) =>
    new Promise<boolean>((resolve, reject) => {
      passport.authenticate('jwt', (err: ApiError, user: string) => {
        // console.log('jwt', err, user)
        if (err) return action.next({ error: err.message, status: err.statusCode })
        if (!user) return action.next({ error: 'Invalid user', status: 401 })

        // Pass on `user` data for cascading middleware access to data
        // 1. in `req.user` for `currentUserChecker` (can only access req.user)
        // 2. in `req.params.user` for controllers (can access req.params.user)
        action.request.user = user
        action.request.params.user = user
        return action.next()
      })(action.request, action.response, action.next)
    }),

  // Current user available via @CurrentUser
  currentUserChecker: async (action: Action) => {
    // from above, `jwtUser` is set in `authorizationChecker`
    // console.log('currentUserChecker', action.request.user, action.request.params.user)
    const userId = action.request.user || undefined
    if (!userId) return action.next({ error: 'Authorization of a user is required', status: 401 })

    // Fetch user from database
    // return AppDataSource.getRepository('User').findOne(userId)
    try {
      const u = entities.User.findOne({ where: { id: userId } })
      if (!u) return action.next({ error: 'User not found', status: 401 })
      return u
    } catch (err) {
      console.log('currentUserChecker', err)
      return action.next({ error: 'Internal server error', status: 500 })
    }
  }
})

const httpServer = createServer(app)
createAndAttachSocketIo(httpServer)

//
// Set up TypeORM
//

// Register all entities (in `data-source.ts`) and "synchronize" database schema, then call
// `initialize()` method of a newly created database to initialize initial connection with db
AppDataSource.initialize()
  .then(async () => {
    // here you can start to work with your database
    winstonLogger.info(`Database connected to ${envVars.DATABASE_URL}`)

    // await AppDataSource.synchronize()

    const flag = process.argv[2]
    if (flag === '--clear' && envVars.NODE_ENV === 'local') {
      // The --clear flag was passed
      const et = entities
      const ets = [et.AiResponse, et.Chat, et.Pod, et.Profile, et.Survey, et.User, et.ValueQuestion]

      ets.forEach(async (entity) => {
        const repo = AppDataSource.getRepository(entity)
        // Only works with postgres (to truncate tables with foreign keys)
        await repo.query(`TRUNCATE TABLE "${repo.metadata.tableName}" CASCADE;`)
      })
    }
  })
  .catch((error) => winstonLogger.error(error))

//
// Attach extra middlewares & start
//
// app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(compression)
app.use(morganLogger)

httpServer.listen(envVars.PORT, async () => {
  winstonLogger.info(`Listening on port ${envVars.PORT}`)

  // const client = redis.createClient({
  //   url: envVars[`REDIS_URL_${envVars.FLY_REGION.toUpperCase()}`],
  //   family: 6,
  //   legacyMode: true,
  //   // socket: {
  //   //   family: 6
  //   // }
  // })
  // client.on('error', err => console.log('Redis Client Error', err));

  // const redisUrl = envVars[`REDIS_URL_${envVars.FLY_REGION.toUpperCase()}`]
  // console.log(redisUrl)
  // const redis = new Redis(`${redisUrl}?family=6`, { family: 6 })

  // redis.set('test', 'key')
  // const item = await redis.get('test')

  // console.log(redis)
  // console.log('test', item)
})

// app.use(passport.initialize())
// app.use(cors())
// app.options('*', cors())
// app.use(morgan('combined'))
// app.use(express.json())

// // Define a route
// app.get('/', (req: Request, res: Response) => {
//   res.send('Hello, world!');
// });

// // Error handling middleware
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack);
//   res.status(500).send({
//       status: 500,
//       message: err.message,
//   });
// });

// const port = process.env.PORT || 3000;

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// })
