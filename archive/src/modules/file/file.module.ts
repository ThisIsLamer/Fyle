import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from './schemas/file.schema';
import { FileGateway } from './file.gateway';
import { RedisModule } from 'src/classes/redis/redis.module';
import { AuthModule } from '../auth/auth.module';
import { MinioModule } from 'src/classes/minio/minio.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    RedisModule,
    AuthModule,
    MinioModule,
  ],
  providers: [
    FileGateway,
    FileService
  ],
  exports: [FileService],
})
export class FileModule {}
