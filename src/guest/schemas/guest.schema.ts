import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import crypto from 'crypto';

export type GuestDocument = HydratedDocument<Guest>;

@Schema({ timestamps: true })
export class Guest {
  @Prop({ default: () => crypto.randomBytes(96).toString('hex') })
  token: string;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);