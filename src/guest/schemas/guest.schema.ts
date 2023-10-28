import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v5 as uuidv5 } from 'uuid';

export type GuestDocument = HydratedDocument<Guest>;

@Schema()
export class Guest {
  @Prop({ default: () => uuidv5(String(Math.random() *2**50), '1b671a64-40d5-491e-99b0-da01ff1f3341') })
  token: string;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);