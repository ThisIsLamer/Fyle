// auth.gateway.ts
import { Inject } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import Redis from 'ioredis';
import { Server } from 'socket.io';
import { GuestService } from 'src/guest/guest.service';
import { Processed, ProcessedPayload } from 'src/utils/default';

@WebSocketGateway({ cors: true })
export class AuthGuestGateway {
  constructor(
    @Inject('REDIS') private readonly redis: Redis,

    private guestService: GuestService,
  ) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('guest-auth')
  async handleGuestAuth(@ProcessedPayload() processed: Processed<{ token: string }>) {
    const { targetClient, payload } = processed;

    const value = await this.redis.get(targetClient.id);
    if (value)
      return targetClient.emit('auth', { success: true, message: 'You are already logged in' });

    const loadedGuest = await this.guestService.findGuest(payload.token);
    if (!loadedGuest) 
      return { success: false, message: 'Invalid token' }

    this.redis.set(targetClient.id, `{ "authType": "guest", "token": ${loadedGuest.token} }`);

    targetClient.emit('guest-auth', loadedGuest );
  }

  @SubscribeMessage('guest-register')
  async handleGuestRegister(@ProcessedPayload() processed: Processed<null>) {
    const { targetClient } = processed;

    if (await this.redis.get(targetClient.id))
      return targetClient.emit('guest-register', { success: false, message: 'You are already registered' });

    const loadedGuest = await this.guestService.create();

    this.redis.set(targetClient.id, `{ "authType": "guest", "token": ${loadedGuest.token} }`);
    targetClient.emit('guest-register', { success: true, guest: loadedGuest });
  }
}
