import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

export const REDIS = 'REDIS';

export function RedisProvider() {
  return {
    provide: REDIS,
    useFactory: (configService: ConfigService) => {
      return new Redis({
        port: configService.get<number>('REDIS_PORT'),
        host: configService.get<string>('REDIS_HOST'),
        family: Number(configService.get<number>('REDIS_FAMILY')),
        password: configService.get<string>('REDIS_PASSWORD'),
        db: configService.get<number>('REDIS_DB'),
      })
    },
    inject: [ConfigService],
  }
};