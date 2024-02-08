import { IBasePayload } from "src/classes/base";

export interface IRegisterFile extends IBasePayload {
  filename: string;
  mimetype: string;
  totalSize: number
}