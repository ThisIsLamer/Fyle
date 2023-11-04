import { IBasePayload } from "src/classes/base";

export interface IUploadFile extends IBasePayload {
  action: "CREATE" | "UPLOAD" | "COMPLEATE";
  name?: string;
  mimetype?: string;
  token?: string;
  data?: string;
}