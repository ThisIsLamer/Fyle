import { Module } from '@nestjs/common';
import { GuestService } from './guest.service';
import { Guest, GuestSchema } from './schemas/guest.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Guest.name, schema: GuestSchema }])
  ],
  providers: [GuestService],
  exports: [GuestService],
})
export class GuestModule {}
