import { OnConnect, SocketController, ConnectedSocket, OnDisconnect, MessageBody, Middleware, OnMessage } from 'socket-controllers'

import AuthenticationMiddleware from '@/middleware/Auth.middleware.ws'

class ChatMessage {
  id: number
  text: string
}

@SocketController('/chat')
export default class ChatController {
  @OnConnect()
  connection(@ConnectedSocket() socket: any) {
    console.log('client connected')
  }

  @OnDisconnect()
  disconnect(@ConnectedSocket() socket: any) {
    console.log('client disconnected')
  }

  @OnMessage('save')
  save(@ConnectedSocket() socket: any, @MessageBody() message: ChatMessage) {
    console.log('received message:', message)
    console.log('setting id to the message and sending it back to the client')
    message.id = 1
    socket.emit('message_saved', message)
  }
}
