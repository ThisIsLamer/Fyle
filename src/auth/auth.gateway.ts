import { Inject } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import Redis from "ioredis";
import { Server } from 'socket.io';
import { IUserPayload } from "src/user/dto/user.dto";
import { UserService } from "src/user/user.service";
import { Processed, ProcessedPayload } from "src/utils/default";

@WebSocketGateway({ cors: true })
export class AuthGateway {
  constructor(
    @Inject('REDIS') private readonly redis: Redis,

    private userService: UserService,
  ) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('auth')
  async handleAuth(@ProcessedPayload() processed: Processed<IUserPayload>) {
    const { targetClient, payload } = processed;
    if (!payload) 
      return targetClient.emit('register', { success: false, message: 'The request was not sent correctly' });
    if (await this.redis.get(`auth-${targetClient.id}`))
      return targetClient.emit('register', { success: true, message: 'You are already logged in' });

    const loadedUser = await this.userService.login(payload);
    if (loadedUser.success)
      this.redis.set(`auth-${targetClient.id}`, `{ success: ${loadedUser.success} }`);

    targetClient.emit('auth', loadedUser);
  }

  @SubscribeMessage('register')
  async handleRegister(
    @ProcessedPayload() processed: Processed<IUserPayload>
  ) {
    const { targetClient, payload } = processed;
    if (!payload) return targetClient.emit('register', ' The request was not sent correctly')
    
    const loadedUser = await this.userService.create(payload);
    if (loadedUser.success)
      this.redis.set(`auth-${targetClient.id}`, loadedUser.session.token);

    targetClient.emit('register', loadedUser);
  }
}
