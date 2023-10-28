// auth.gateway.ts
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class AuthGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('auth')
  handleAuth(client: Socket, data: any): void {
    console.log('Auth data received:', data);
    // Вы можете добавить здесь логику аутентификации
    // и отправить ответ клиенту
    client.emit('auth', { success: true, data, clientId: client.id });
  }
}