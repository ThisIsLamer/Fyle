declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_PORT: number;
      APP_LOGS: boolean;
      
      MONGO_CONNECT: string;
    }
  }
}

export {};