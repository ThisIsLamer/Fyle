export interface IUserPayload {
  login: string,
  password: string,
  token?: string,
}

export interface IUserRedis {
  authType: "guest" | "user";
  token: string;
}
