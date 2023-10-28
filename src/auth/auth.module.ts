import { Module } from '@nestjs/common';
import { AuthGateway } from './auth.gateway';
import { GuestModule } from 'src/guest/guest.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register(),
    GuestModule
  ],
  providers: [AuthGateway]
})
export class AuthModule {}
