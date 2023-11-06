import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { Socket } from 'socket.io';
import { SessionService } from 'src/modules/session/session.service';
import { ICacheUserData } from './dto/auth.dto';
import { GuestService } from '../guest/guest.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS') private readonly redis: Redis,

    private readonly sessionService: SessionService,
    private readonly guestService: GuestService,
  ) {}

  public async checkAuth(emitName: string, targetClient: Socket, payload?: any) {
    let loadedUser: string | ICacheUserData = await this.redis.get(targetClient.id);
    if (!loadedUser) {
      targetClient.emit(emitName, { success: false, message: 'You are not authorized', id: payload?.id });
      throw new Error('User are not authorized');
    }

    loadedUser = JSON.parse(loadedUser) as ICacheUserData;
    if (loadedUser.authType === 'guest')
      return { authType: 'guest', user: await this.guestService.findGuest(loadedUser.token), id: payload?.id };
    if ( loadedUser.authType === 'user' )
      return { authType: 'user', user: (await this.sessionService.getSession(loadedUser.token)).user, id: payload?.id };

    targetClient.emit(emitName, { success: false, message: 'Could not find user', id: payload?.id });
    throw new Error('Could not find user')
  }

}
