import { Module } from '@nestjs/common';
import { AuthGuestGateway } from './authGuest.gateway';
import { GuestModule } from 'src/modules/guest/guest.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisModule } from 'src/classes/redis/redis.module';
import { AuthGateway } from './auth.gateway';
import { UserModule } from 'src/modules/user/user.module';
import { AuthService } from './auth.service';
import { SessionModule } from 'src/modules/session/session.module';

@Module({
  imports: [
    CacheModule.register(),
    RedisModule,
    GuestModule,
    SessionModule,
    UserModule,
  ],
  providers: [
    AuthGuestGateway, 
    AuthGateway, 
    AuthService
  ],
  exports: [AuthService]
})
export class AuthModule {}
