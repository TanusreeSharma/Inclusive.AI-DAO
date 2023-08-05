import 'reflect-metadata' // for routing-controllers

import compression from 'compression'
import path from 'path'
import passport from 'passport'
// import morgan from 'morgan'
import { Action, createExpressServer } from 'routing-controllers'
// import socketIO from 'socket.io'

import { envVars, jwtStrategy } from '@/config'
import { ApiError } from '@/utils'

// Custom JWT strategy
passport.use('jwt', jwtStrategy)

//
// Set up express server
//

const app = createExpressServer({
  cors: true,
  controllers: [
    path.join(__dirname + '/controllers/*.controller.ts')
  ],
  middlewares: [
    path.join(__dirname + '/middleware/*.middleware.ts')
  ],
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

//
// Attach legacy middlewares
//

app.use(compression)

//
// Socketio setup
//

const server = require('http').createServer(app);
const io = require('socket.io')(server)

io.on('connection', (socket) => {
  console.log('user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
})

server.listen(envVars.PORT, function() {
  console.log(`Listening on port ${envVars.PORT}`);
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
