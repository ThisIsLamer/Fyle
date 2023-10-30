import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { GuestModule } from './guest/guest.module';
import { RedisModule } from './redis/redis.module';
import { UserModule } from './user/user.module';
import { validate } from './env.validation';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({ validate, isGlobal: true }),
    CacheModule.register(),
    MongooseModule.forRoot(process.env.MONGO_CONNECT),
    RedisModule,
    AuthModule,
    GuestModule,
    UserModule,
    SessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
