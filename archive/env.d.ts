declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_PORT: number;
      APP_LOGS: boolean;
      
      MONGO_CONNECT: string;

      DOCKER_HOSTNAME: string;

      REDIS_PORT: number;
      REDIS_HOST: string;
      REDIS_FAMILY: number;
      REDIS_PASSWORD: string;
      REDIS_DB: number;

      SALT: string
      SALT_ROUNDS: number;
    }
  }
}

export {};