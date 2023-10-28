// auth.gateway.ts
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import { GuestService } from 'src/guest/guest.service';

@WebSocketGateway({ cors: true })
export class AuthGateway {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    private guestService: GuestService,
  ) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('auth')
  async handleAuth(client: Socket, payload: string) {
    const data = JSON.parse(payload);
    const targetClient = this.server.sockets.sockets.get(client.id);

    const value = await this.cacheManager.get<string>(client.id);
    if (value)
      return targetClient.emit('auth', { success: true, message: 'You are already logged in' });

    const loadedGuest = await this.guestService.findGuest(data.token);
    if (loadedGuest.success) 
      this.cacheManager.set(client.id, loadedGuest, 0);

    targetClient.emit('auth', loadedGuest);
  }

  @SubscribeMessage('register')
  async handleRegister(client: Socket) {
    const targetClient = this.server.sockets.sockets.get(client.id);
    if (await this.cacheManager.get(client.id))
      return targetClient.emit('register', { success: false, message: 'You are already registered' });

    const loadedGuest = await this.guestService.create();

    this.cacheManager.set(client.id, loadedGuest, 0);
    targetClient.emit('register', { success: true, guest: loadedGuest });
  }
}