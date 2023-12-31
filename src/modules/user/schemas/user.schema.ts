import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Session } from 'src/modules/session/schemas/session.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  avatar: string;

  @Prop([{ type: Types.ObjectId, ref: 'Session' }])
  sessions: (Session | Types.ObjectId)[];

  @Prop([{ type: Types.ObjectId, ref: 'File' }])
  files: (File | Types.ObjectId)[];
}

export const UserSchema = SchemaFactory.createForClass(User);
