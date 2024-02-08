import { Module } from '@nestjs/common';
import { REDIS, RedisProvider } from 'src/classes/utils/configs/redis.config';

@Module({
  providers: [RedisProvider()],
  exports: [REDIS],
})
export class RedisModule {}