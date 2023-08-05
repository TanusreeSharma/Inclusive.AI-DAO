import 'es6-shim'
import 'reflect-metadata' // for routing-controllers

import compression from 'compression'
import express from 'express'
import { createServer } from 'http'
import path from 'path'
import passport from 'passport'
// import morgan from 'morgan'
import { Action, useExpressServer } from 'routing-controllers'
import { SocketControllers } from 'socket-controllers'
import { Server as SocketIoServer } from 'socket.io'
import { Container } from 'typedi'

import { envVars, jwtStrategy } from '@/config'
import { ApiError } from '@/utils'
import ChatController from './controllers/Chat.controller.ws'

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
  middlewares: [path.join(__dirname + '/middleware/*.middleware.ts')],
  authorizationChecker: (action: Action) =>
    new Promise<boolean>((resolve, reject) => {
      passport.authenticate('jwt', (err: ApiError, user: string) => {
        console.log(err, user)
        if (err) return reject(err)
        if (!user) return resolve(false)

        action.request.user = user // pass `user` data to further controller
        return resolve(true)
      })(action.request, action.response, action.next)
    }),
  currentUserChecker: (action: Action) => action.request.user
})

const httpServer = createServer(app)
const socketIo = new SocketIoServer(httpServer)

// socketIo.use((socket: any, next: Function) => {
//   console.log('Custom middleware')
//   next()
// })

new SocketControllers({
  io: socketIo,
  // port: envVars.PORT,
  container: Container,
  controllers: [path.join(__dirname + '/controllers/*.controller.ws.ts')],
  middlewares: [path.join(__dirname + '/middleware/*.middleware.ws.ts')]
})

//
// Attach legacy middlewares & start
//

app.use(compression)

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
