import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { File, FileDocument } from './schemas/file.schema';
import { Model } from 'mongoose';
import * as fs from 'fs/promises';
import { UserService } from 'src/modules/user/user.service';
import { GuestService } from 'src/modules/guest/guest.service';
import { SessionService } from 'src/modules/session/session.service';
import { User, UserDocument } from 'src/modules/user/schemas/user.schema';
import { IUserRedis } from 'src/modules/user/dto/user.dto';
import { createWriteStream, writeFile } from 'fs';
import { join, resolve } from 'path';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class FileService {
  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<File>
  ) {}

  public async registerFile(
    loadedUser: Awaited<ReturnType<InstanceType<typeof AuthService>['checkAuth']>>,
    filename: string,
    mimetype: string,
    totalSize: number,
  ) {
    const loadedFile = await this.fileModel.create({ name: filename, mimetype, size: totalSize });
    loadedFile[loadedUser.authType] = loadedUser.user._id;
    await loadedFile.save();

    return new Promise<{ success: boolean, token?: string, message?: string }>((resolve, reject) => {
      writeFile(join(process.cwd(), 'uploads', loadedFile.token), Buffer.alloc(totalSize), (err) => {
        if (err) return reject({ success: false, message: 'File cannot be created' });
        resolve({ success: true, token: loadedFile.token });
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
      start: blockIndex * 2 * 1024 * 1024,
    });
    
    return new Promise<{ success: boolean, error?: Error }>((resolve, reject) => {
      fileStream.write(data, (error) => {
        fileStream.close();
        if (error) reject({ success: false, error });
        else resolve({ success: true });
      });
    });
  }
}
