import { Inject } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import Redis from "ioredis";
import { Server } from 'socket.io';
import { IUserPayload } from "src/modules/user/dto/user.dto";
import { UserService } from "src/modules/user/user.service";
import { Processed, ProcessedPayload } from "src/classes/utils/default";

@WebSocketGateway({ cors: true, maxHttpBufferSize: 5e6 })
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
      return targetClient.emit('auth', { success: false, message: 'The request was not sent correctly', id: payload.id ?? -1 });
    if (await this.redis.get(targetClient.id))
      return targetClient.emit('auth', { success: true, message: 'You are already logged in', id:payload.id ?? -1 });

    const loadedUser = await this.userService.login(payload);
    if (loadedUser.success)
      this.redis.set(targetClient.id, `{ "authType": "user", "token": "${loadedUser.session.token}" }`);

    targetClient.emit('auth', { ...loadedUser, id: payload.id ?? -1 });
  }

  @SubscribeMessage('register')
  async handleRegister(
    @ProcessedPayload() processed: Processed<IUserPayload>
  ) {
    const { targetClient, payload } = processed;
    if (!payload) 
      return targetClient.emit('register', { success: true, message: 'The request was not sent correctly', id:payload.id ?? -1 })

    const loadedUser = await this.userService.create(payload);
    if (loadedUser.success)
      this.redis.set(targetClient.id, `{ "authType": "user", "token": "${loadedUser.session.token}" }`);

    targetClient.emit('register', { ...loadedUser, id: payload.id ?? -1 });
  }
}
