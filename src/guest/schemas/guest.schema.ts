import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as crypto from 'crypto';

export type GuestDocument = HydratedDocument<Guest>;

@Schema({ timestamps: true })
export class Guest {
  @Prop({ default: () => crypto.randomBytes(96).toString('hex') })
  token: string;

  @Prop([{ type: Types.ObjectId, ref: 'File' }])
  files: (File | Types.ObjectId)[];
}

export const GuestSchema = SchemaFactory.createForClass(Guest);