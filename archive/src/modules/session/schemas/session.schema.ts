import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as crypto from 'crypto';
import { User } from 'src/modules/user/schemas/user.schema';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: true })
export class Session {
  @Prop({ default: () => crypto.randomBytes(96).toString('hex') })
  token: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User | Types.ObjectId;
}

export const SessionSchema = SchemaFactory.createForClass(Session);