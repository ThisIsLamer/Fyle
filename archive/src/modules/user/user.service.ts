import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { IUserPayload } from './dto/user.dto';
import * as bcrypt from "bcrypt";
import { ConfigService } from '@nestjs/config';
import { SessionService } from 'src/modules/session/session.service';

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

    return { success: true, session: await this.sessionService.createSession(createdUser.id) };
  }

  async login(userPayload: IUserPayload) {
    if (userPayload?.token) {
      const loadedSession = await this.sessionService.getSession(userPayload.token);
      if (loadedSession)
        return { success: true, session: loadedSession };
      return { success: false, message: 'Invalid token' };
    }

    const loadedUser = await this.findUserForLogin(userPayload.login);
    if (!loadedUser) return { success: false, message: 'User is not found' }

    const statusPassword = await bcrypt.compare(
      userPayload.password + this.configService.get<string>('SALT'), 
      loadedUser?.password
    );

    if (statusPassword) 
      return { success: statusPassword, session: await this.sessionService.createSession(loadedUser.id) };

    return { success: statusPassword, message: 'Incorrect login or password' };
  }
}
