import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from './schemas/session.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}

  public async createSession(userId: Types.ObjectId) {
    if (!userId) return;

    return new this.sessionModel({ user: userId }).save();
  }

  public async getSession(token: string) {
    return this.sessionModel.findOne({ token });
  }
}
