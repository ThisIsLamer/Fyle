import { Module } from '@nestjs/common';
import { AuthGuestGateway } from './authGuest.gateway';
import { GuestModule } from 'src/guest/guest.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisModule } from 'src/redis/redis.module';
import { AuthGateway } from './auth.gateway';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    CacheModule.register(),
    RedisModule,
    GuestModule,
    UserModule,
  ],
  providers: [
    AuthGuestGateway, 
    AuthGateway
  ]
})
export class AuthModule {}
