import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { File, FileDocument } from './schemas/file.schema';
import { Model } from 'mongoose';
import { createWriteStream, mkdir, unlink, writeFile } from 'fs';
import { dirname, join, resolve } from 'path';
import { AuthService } from '../auth/auth.service';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { REDIS } from 'src/classes/utils/configs/redis.config';
import { MinioService } from 'src/classes/minio/minio.service';

@Injectable()
export class FileService {
  private readonly BASE_PATH = join(process.cwd(), 'uploads');

  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly configService: ConfigService,
    private readonly minioService: MinioService,


    @InjectModel(File.name) private readonly fileModel: Model<File>
  ) {}

  private async loadToStorage(token: string) {
    const loadedFile = JSON.parse(await this.redis.get(`file-${token}`)) as FileDocument;
    if ((await this.redis.lrange(`file-blocks-${token}`, 0, -1)).length !== loadedFile._blocks) return;

    const filePath = join(this.BASE_PATH, token);
    const loadedStorageFile = await this.minioService.uploadFile(token, filePath);
    if (!loadedStorageFile) return { success: false, error: 'Failed to upload file to storage.' };

    this.fileModel.findOneAndUpdate({ token }, { _loaded: true }).exec();
    this.redis.del(`file-blocks-${token}`, `file-${token}`);

    return new Promise((resolve, reject) => {
      unlink(filePath, (error) => {
        if (error) {
          return resolve({ success: false, error });
        }
        resolve({ success: true })
      });
    })
  }

  public async registerFile(
    loadedUser: Awaited<ReturnType<InstanceType<typeof AuthService>['checkAuth']>>,
    filename: string,
    mimetype: string,
    totalSize: number,
  ) {
    const loadedFile = await this.fileModel.create({ 
      name: filename, 
      mimetype, 
      size: totalSize,
      _blocks: Math.ceil(totalSize / (this.configService.get<number>('APP_RANGE_BLOCK_FILE') * 1024 * 1024)),
    });
    loadedFile[loadedUser.authType] = loadedUser.user._id;
    await loadedFile.save();

    return new Promise<{ success: boolean, token?: string, message?: string }>((resolve, reject) => {
      const filePath = join(this.BASE_PATH, loadedFile.token);

      mkdir(dirname(filePath), { recursive: true }, (err) => {
        writeFile(join(this.BASE_PATH, loadedFile.token), Buffer.alloc(0), (err) => {
          if (err) return reject({ success: false, message: 'File cannot be created' });
  
          this.redis.set(`file-${loadedFile.token}`, JSON.stringify(loadedFile));
  
          resolve({ success: true, token: loadedFile.token });
        });
      });
    })
  }

  public async appendToFile(token: string, blockIndex: number, data: Uint8Array) {
    const loadedFile = await this.fileModel.findOne({ token })
    if (!loadedFile)
      return { success: false, message: 'File not registered' };
    
    const filePath = join(process.cwd(), 'uploads', loadedFile.token);
    const fileStream = createWriteStream(filePath, {
      flags: 'r+',
      start: blockIndex * this.configService.get<number>('APP_RANGE_BLOCK_FILE') * 1024 * 1024,
    });
    
    return new Promise<{ success: boolean, error?: Error }>((resolve, reject) => {
      fileStream.write(data, async (error) => {
        fileStream.close();
        if (error) return reject({ success: false, error });

        this.redis.rpush(`file-blocks-${token}`, blockIndex)
          .then(async () => {
            const loadedFile = await this.loadToStorage(token);
            if (!loadedFile) return resolve({ success: true });

            resolve(loadedFile as any);
          })
          .catch((err) => reject({ success: false, error: err }));        
      });
    });
  }
}
