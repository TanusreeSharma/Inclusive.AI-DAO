import { Server } from 'http'
import { Server as SocketIoServer } from 'socket.io'

import { envVars } from '@/config'

export function createAndAttachSocketIo(httpServer: Server) {
  const socketIo = new SocketIoServer(httpServer, {
    path: '/socket', // wss://{url}/socket/{namespace}
    // transports: ['websocket'],
    cors: {
      origin: envVars.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://inclusive-ai.vercel.app',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      credentials: true
    },
    // allowRequest: (req, callback) => {
    //   let originIsAllowed = req.headers.origin === 'https://inclusive-ai.vercel.app'
    //   if (envVars.NODE_ENV === 'development') {
    //     console.log(req.headers.origin)
    //     originIsAllowed = typeof req.headers.origin === undefined || req.headers.origin === 'http://localhost:3000'
    //   }
    //   callback(null, originIsAllowed) // only allow requests with specified 'origin' header
    // }
    serveClient: false,
    // below are engine.IO options
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
  })

  // socketIo.use((socket, next) => {
  //   console.log('Custom middleware')
  //   // console.log(socket.handshake)
  //   next()
  // })

  // Namespaces
  const namespaceChat = socketIo.of('/chat')
  const namespaceMessages = socketIo.of('/messages')

  socketIo.on('connection', (socket) => {
    // console.log('/', socket.handshake)
    console.log('/ connection')
  })

  namespaceChat.on('connection', (socket) => {
    // console.log('/chat', socket.handshake)
    // console.log('/chat connection')
    // socket.join("room1");
    // socketNsChat.to("room1").emit("hello");
  })

  // middleware
  namespaceChat.use((socket, next) => {
    // ensure the socket has access to the "users" namespace, and then
    next()
  })

  namespaceChat.on('chat', (...args) => {
    console.log('chat', args)
  })

  namespaceMessages.on('connection', (socket) => {
    console.log('/messages connection')
  })

  return socketIo
}
