import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from './schemas/file.schema';
import { UserModule } from 'src/user/user.module';
import { GuestModule } from 'src/guest/guest.module';
import { SessionModule } from 'src/session/session.module';
import { FileGateway } from './file.gateway';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    RedisModule,
    UserModule,
    SessionModule,
    GuestModule,
  ],
  providers: [
    FileGateway,
    FileService
  ],
  exports: [FileService],
})
export class FileModule {}
