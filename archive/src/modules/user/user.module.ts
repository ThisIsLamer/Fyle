import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { SessionModule } from 'src/modules/session/session.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SessionModule,
  ],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
