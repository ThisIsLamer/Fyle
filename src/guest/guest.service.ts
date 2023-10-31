import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Guest } from './schemas/guest.schema';
import { Model } from 'mongoose';

@Injectable()
export class GuestService {
  constructor(@InjectModel(Guest.name) private guestModel: Model<Guest>) {}

  async create(): Promise<Guest> {
    const createdGuest = new this.guestModel();
    return createdGuest.save();
  }

  async findGuest(token: string) {
    return await this.guestModel.findOne({
      token
    }).exec();
  }
}
