import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as crypto from 'crypto';
import { User } from 'src/user/schemas/user.schema';
import { Guest } from 'src/guest/schemas/guest.schema';

export type FileDocument = HydratedDocument<File>;

@Schema({ timestamps: true })
export class File {
  @Prop({ default: () => crypto.randomBytes(26).toString('hex') })
  token: string;

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  mimetype: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Guest' })
  guest: Guest | Types.ObjectId;
}

export const FileSchema = SchemaFactory.createForClass(File);