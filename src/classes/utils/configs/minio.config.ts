import { Client as MinioClient } from 'minio';
import { ConfigService } from '@nestjs/config';

export const MINIO_CONNECTION = 'MINIO';

export const MinioProvider = {
  provide: MINIO_CONNECTION,
  useFactory: (configService: ConfigService) => {
    return new MinioClient({
      endPoint: configService.get<string>('MINIO_ENDPOINT'),
      port: +configService.get<number>('MINIO_PORT'),
      useSSL: Boolean(configService.get<boolean>('MINIO_USE_SSL')),
      accessKey: configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: configService.get<string>('MINIO_SECRET_KEY'),
    });
  },
  inject: [ConfigService],
};