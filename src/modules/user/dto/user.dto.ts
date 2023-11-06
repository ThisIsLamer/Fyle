import { IBasePayload } from "src/classes/base";

export interface IUserPayload extends IBasePayload {
  login: string,
  password: string,
  token?: string,
}

export interface IUserRedis {
  authType: "guest" | "user";
  token: string;
}
