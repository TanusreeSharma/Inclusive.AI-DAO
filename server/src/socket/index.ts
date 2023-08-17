import { Server } from 'http'
import { JwtPayload } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { Socket, Server as SocketIoServer } from 'socket.io'

import { JWKS_ALGORITHMS, JWKS_URL, envVars, openai } from '@/config'
import { jwtAuthorize } from '@/socket/JwtMiddleware'
import { GptChatDialogue } from '@/types'
import { DefaultEventsMap, EventsMap } from 'socket.io/dist/typed-events'
import { AiResponse, Chat, User } from '@/database/entity'
import AppDataSource from '@/database/data-source'
import { ChatCompletionRequestMessage } from 'openai'

interface ListenEvents extends DefaultEventsMap {} // Events listened to on the server
interface ServerEvents extends ListenEvents {} // Events sent by the server
interface ServerSideEvents extends DefaultEventsMap {} // Events sent between the server and client

// interface AuthorizedSocket<ListenEvents extends EventsMap = DefaultEventsMap, EmitEvents extends EventsMap = ListenEvents, ServerSideEvents extends EventsMap = DefaultEventsMap> extends Socket<ListenEvents, EmitEvents, ServerSideEvents, {}> {
//   encodedToken: string
//   decodedToken: JwtPayload
// }

interface NspChatSocketData {
  // _decodedToken: JwtPayload
}

function isPersonalChannel(channel: string, userId: string) {
  return channel === userId
}

function isPodChannel(channel: string) {
  return channel.startsWith('pod-')
}

export function createAndAttachSocketIo(httpServer: Server) {
  const jwks = jwksClient({ jwksUri: JWKS_URL })

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

  // chat: match any namespace that begins with `/chat/` that contains alphanumeric characters, _, -, ., or @
  // const nspChat = socketIo.of(/^\/chat\/[a-z0-9\.\_\-\@]*$/i)
  const nspChat = socketIo.of('/chat')
  const nspMessages = socketIo.of('/messages')

  // middleware
  nspChat.use((socket, next) => {
    // ensure the socket has access to the "users" namespace, and then
    console.log('middleware', socket.id)
    next()
  })

  nspChat.use(
    jwtAuthorize({
      algorithms: JWKS_ALGORITHMS,
      secret: async (decodedToken) => {
        return new Promise((resolve, reject) => {
          jwks.getSigningKey(decodedToken.header.kid, (err, key) => {
            if (err) reject(err)
            else resolve(key.getPublicKey())
          })
        })
      },
      // => decodedToken is accessible via `socket.decodedToken`
      onAuthentication: async (decodedToken) => {
        // return the object that you want to add to the user property
        // or throw an error if the token is unauthorized
        // console.log('onAuthentication', decodedToken) // => decoded jwt.body
        return decodedToken
      }
    })
  )

  socketIo.on('connection', (socket) => {
    // console.log('/', socket.handshake)
    console.log('/ connection')
    // const newNamespace = socket.nsp
    // // broadcast to all clients in the given sub-namespace
    // newNamespace.emit('hello')
  })

  nspChat.on('connection', (_socket: Socket<ListenEvents, ServerEvents, ServerSideEvents, NspChatSocketData>) => {
    // Hack to attach `user` property to socket
    const socket = _socket as Socket<ListenEvents, ServerEvents, ServerSideEvents, NspChatSocketData> & {
      user: JwtPayload
    }

    // console.log('/chat', socket.handshake)
    // console.log('/chat connection')
    const namespace = socket.nsp
    console.log('connection', socket.id)

    socket.on('join', (data) => {
      if (!data?.channel) return
      if (!socket.user) return

      const channel = data.channel as string

      // invalid email (channel) given by the user (mismatch)
      if (socket.user.email !== channel) return // && socket.data._decodedToken.verifierId !== channel

      console.log('join', channel)
      socket.join(channel)
      nspChat.to(channel).emit('chat_message', 'Welcome to the chat!')
    })

    socket.on('chat', async (data) => {
      // console.log(socket)
      // console.log('chat', data)
      if (!('message' in data)) return
      if (!socket.user) return

      const userId = socket.user.email

      // Last dialogue must be user's
      const message = data.message as GptChatDialogue
      const channelId = data.channelId as string
      if (message.role !== 'user') return
      console.log(message)
      console.log(socket.id)

      if (channelId.startsWith('pod-') && socket.rooms) {
        const podId = parseInt(channelId.split('-')[1]) || 1

        // fetch pod data

        nspChat.to(channelId).emit('chat_message', { message })
      }

      // If user's personal room exists and user's socket has joined the personal room:
      else if (channelId === userId && socket.rooms.has(userId)) {
        // Get all messages
        // const channelId = userId // socket.id (FOR NOW, use `userId` because we only have one question to discuss)
        const chatHistoryRaw = await AppDataSource.getRepository(Chat)
          .createQueryBuilder('chat')
          .leftJoin('chat.user', 'user') // don't select (NEED for `where` clause below)
          .where('user.id = :userId AND chat.channel = :channelId', { userId, channelId: socket.id })
          .getMany()
          .catch((err) => {
            console.log(err)
            return [] as Chat[]
          })
        // console.log(chatHistoryRaw)

        // format chatHistory into ChatCompleteionRequestMessage types
        const chatHistory = chatHistoryRaw
          .map((chat) => {
            const chats = [
              {
                role: 'user' as 'user',
                content: chat.text
              }
            ] as ChatCompletionRequestMessage[]

            if (chat.aiResponse) {
              chats.push({
                role: 'assistant' as 'assistant',
                content: chat.aiResponse.text
              })
            }

            return chats
          })
          .flat()
        // console.log('chatHistory', chatHistory)

        // Generate bot message using GPT-3.5
        const chatCompletion = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                "This is an interactive conversation where you, the AI assistant, will help users in digesting value topics pertinent to the AI alignments with humanity, and creating a thoughtful opinion on such topics before discussing them with other members. You will response to the user's prompts. Limit your response to the maximum of two sentences, and three sentences if you must need another sentence to provide critical information. Each sentence must be short and deliver concise information without too many punctuations and complex words. You should regard most of the users as laymen and write simple words for the comprehension level of high school students. You must not repeat the prompt written by the user. If a user asks a question, do not start your response by repeating the question. You must keep it like a human-to-human, personal conversation. Users will rely on your information to formulate their own opinions and discuss with others on the topic."
            },
            ...chatHistory,
            message
          ],
          max_tokens: 1024
        })

        const aiMessage = chatCompletion.data.choices[0].message

        // Send message to user in their self room
        nspChat.to(userId).emit('chat_message', { message: aiMessage })
        // socket.emit('chat_message', { message: aiMessage })

        // Create the new message entry
        const newChat = new Chat()
        // TODO: make sure User exists
        newChat.user = await User.findOne({ where: { id: userId } })
        newChat.channel = userId
        newChat.connection = socket.id
        newChat.createdAt = new Date()
        newChat.text = message.content
        await newChat.save()

        // Save the AI response
        const newAiResponse = new AiResponse()
        newAiResponse.text = aiMessage.content
        newAiResponse.channel = userId
        newAiResponse.createdAt = new Date()
        newAiResponse.chat = newChat
        await newAiResponse.save()

        newChat.aiResponse = newAiResponse
        await newChat.save()
      }
    })
  })

  nspMessages.on('connection', (socket) => {
    console.log('/messages connection')
  })

  return socketIo
}
