import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Session } from 'src/session/schemas/session.schema';

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
}

export const UserSchema = SchemaFactory.createForClass(User);