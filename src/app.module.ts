import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthGateway } from './auth/auth.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register()
  ],
  controllers: [AppController],
  providers: [AppService, AuthGateway],
})
export class AppModule {}
