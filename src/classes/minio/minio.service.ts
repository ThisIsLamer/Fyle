import { Inject, Injectable } from '@nestjs/common';
import { MINIO_CONNECTION } from '../utils/configs/minio.config';
import { Client as MinioClient } from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService {
  constructor(
    @Inject(MINIO_CONNECTION) private readonly minioClient: MinioClient,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(objectName: string, filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(objectName, filePath);
      this.minioClient.fPutObject(
        this.configService.get<string>('MINIO_DEFAULT_BASKET'), 
        objectName, 
        filePath, 
        (err, etag) => {
          if (err) {
            reject(err);
          } else {
            resolve(etag);
          }
        }
      );
    });
  }
}
