import { plainToInstance } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  APP_PORT: number;

  @IsBoolean()
  APP_LOGS: boolean;

  @IsString()
  MONGO_CONNECT: string;

  @IsString()
  DOCKER_HOSTNAME: string;

  @IsNumber()
  REDIS_PORT: number;

  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_FAMILY: number;

  @IsString()
  REDIS_PASSWORD: string;

  @IsNumber()
  REDIS_DB: number;

  @IsString()
  SALT: string;

  @IsNumber()
  SALT_ROUNDS: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
