import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { IUserPayload } from './dto/user.dto';
import * as bcrypt from "bcrypt";
import { ConfigService } from '@nestjs/config';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,

    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  private async findUserForLogin(login: string) {
    return await this.userModel.findOne({ login });
  }

  private async createSession(userId: Types.ObjectId) {
    return await this.sessionService.createSession(userId);
  }

  async create(userPayload: IUserPayload) {
    if (await this.findUserForLogin(userPayload.login))
      return { success: false, message: 'A user with this login already exists' };

    let createdUser = new this.userModel();

    createdUser.login = userPayload.login;
    createdUser.password = await bcrypt.hash(
      userPayload.password + this.configService.get<string>('SALT'),
      this.configService.get<number>('SALT_ROUNDS')
    );

    await createdUser.save();

    return { success: true, session: await this.createSession(createdUser.id) };
  }

  async login(userPayload: IUserPayload) {
    if (userPayload?.token) {
      const loadedSession = this.sessionService.getSession(userPayload.token);
      if (loadedSession)
        return { success: true };
      return { success: false, message: 'Invalid token' };
    }

    const loadedUser = await this.findUserForLogin(userPayload.login);

    const statusPassword = await bcrypt.compare(
      userPayload.password + this.configService.get<string>('SALT'), 
      loadedUser?.password
    );

    if (statusPassword) 
      return { success: statusPassword, session: await this.createSession(loadedUser.id) };

    return { success: statusPassword, message: 'Incorrect login or password' };
  }
}
