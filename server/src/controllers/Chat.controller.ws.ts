import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  OnDisconnect,
  MessageBody,
  NspParams,
  OnMessage
} from 'socket-controllers'

type ChatMessage = {
  userName: number
  userId: string
  message: string
}

@SocketController('/socket/chat')
export default class ChatController {
  @OnConnect()
  connection(@ConnectedSocket() socket: any) {
    console.log('client connected')
  }

  @OnDisconnect()
  disconnect(@ConnectedSocket() socket: any) {
    console.log('client disconnected')
  }

  @OnMessage('chat')
  chatSelf(@ConnectedSocket() socket: any, @MessageBody() msg: ChatMessage, @NspParams() params: any[]) {
    console.log('received message:', msg)
    console.log('received params:', params)

    socket.emit('chat_message', {
      username: msg.userName,
      message: msg.message
    })
  }
}

@SocketController('/socket/messages/:id')
export class MessageController {
  @OnConnect()
  connection(@ConnectedSocket() socket: any) {
    console.log('client connected');
  }

  @OnDisconnect()
  disconnect(@ConnectedSocket() socket: any) {
    console.log('client disconnected');
  }

  @OnMessage('save')
  async save(@ConnectedSocket() socket: any, @MessageBody() message: any, @NspParams() params: any[]) {
    console.log('received message:', message);
    console.log('namespace params:', params);
    console.log('setting id to the message and sending it back to the client');
    message.id = 1;
    socket.emit('message_saved', message);
  }
}