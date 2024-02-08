import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MinioProvider } from '../utils/configs/minio.config';

@Module({
  providers: [MinioProvider, MinioService],
  exports: [MinioProvider, MinioService]
})
export class MinioModule {}
