import 'es6-shim'
import 'reflect-metadata' // make @decorators work properly (for `routing-controllers` and `typeorm`)

import compression from 'compression'
import express from 'express'
import { createServer } from 'http'
import path from 'path'
import passport from 'passport'
import morgan from 'morgan'
import { Action, useExpressServer } from 'routing-controllers'

import { envVars, jwtStrategy, morganLogger } from '@/config'
import AppDataSource from '@/database/data-source'
import { User } from '@/database/entity'
import { CustomErrorHandler, JwtAuthMiddleware } from '@/middleware'
import { createAndAttachSocketIo } from '@/socket'
import { ApiError } from '@/utils'

// Custom JWT strategy
passport.use('jwt', jwtStrategy)

//
// Set up express server with websocket enabled
// Need to use `useExpressServer` instead of `createExpressServer` to combine both routing-controllers and socket-controllers
//

let app = express()

useExpressServer(app, {
  cors: true,
  controllers: [path.join(__dirname + '/controllers/*.controller.ts')],
  // middlewares: [path.join(__dirname + '/middleware/*.middleware.ts')],
  middlewares: [
    CustomErrorHandler
    // JwtAuthMiddleware,
  ],
  // defaultErrorHandler: false, // use custom error handler
  // Authorization
  authorizationChecker: (action: Action) =>
    new Promise<boolean>((resolve, reject) => {
      passport.authenticate('jwt', (err: ApiError, user: string) => {
        // if (err) return reject(err)
        // if (!user) return resolve(false)
        // action.request.jwtUser = user // pass `user` data to further controller
        // return resolve(true)
        console.log(action.request.body)

        // console.log(err, user)
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
    const userId = action.request.user || undefined
    if (!userId) return action.next({ error: 'Authorization of a user is required', status: 401 })

    // Fetch user from database
    // return AppDataSource.getRepository('User').findOne(userId)
    try {
      return AppDataSource.getRepository(User)
        .createQueryBuilder('user')
        .where('user.id = :userId', { userId })
        .getOne()
    } catch (err) {
      return action.next({ error: 'User not found', status: 401 })
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
  .then(() => {
    // here you can start to work with your database
    console.log(`Database connected to ${envVars.POSTGRES_HOST}; DB: ${envVars.POSTGRES_DB}`)
  })
  .catch((error) => console.log(error))

//
// Attach extra middlewares & start
//

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(compression)
app.use(morganLogger)

httpServer.listen(envVars.PORT, function () {
  console.log(`Listening on port ${envVars.PORT}`)
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
