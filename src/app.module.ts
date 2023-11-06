import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { GuestModule } from './modules/guest/guest.module';
import { RedisModule } from './classes/redis/redis.module';
import { UserModule } from './modules/user/user.module';
import { validate } from './env.validation';
import { SessionModule } from './modules/session/session.module';
import { FileModule } from './modules/file/file.module';

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
    FileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
