import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { File, FileDocument } from './schemas/file.schema';
import { Model } from 'mongoose';
import * as fs from 'fs/promises';
import { UserService } from 'src/user/user.service';
import { GuestService } from 'src/guest/guest.service';
import { SessionService } from 'src/session/session.service';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { IUploadFile } from './dto/file.dto';
import { IUserRedis } from 'src/user/dto/user.dto';

@Injectable()
export class FileService {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly guestService: GuestService,

    @InjectModel(File.name) private readonly fileModel: Model<File>
  ) {}

  private async createFile(user: IUserRedis, file: IUploadFile) {
    let createdFile = new this.fileModel();

    if (user.authType === 'user') {
      const loadedUser = (await this.sessionService.getSession(user.token)).user as UserDocument;
      createdFile = await this.fileModel.create({ user: loadedUser._id });
    } else {
      const loadedGuest = await this.guestService.findGuest(user.token);
      createdFile = await this.fileModel.create({ guest: loadedGuest._id });
    }

    createdFile.name = file.name;
    createdFile.mimetype = file.mimetype;
    

    // const payloadData = file.data.split('|');

  }

  public async streamFile(loadedUser: string, file: IUploadFile) {
    if (file.action === "CREATE") 
      this.createFile(JSON.parse(loadedUser), file);

  }
}
