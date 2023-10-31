export interface IUploadFile {
  action: "CREATE" | "UPLOAD" | "COMPLEATE";
  name?: string;
  mimetype?: string;
  token?: string;
  data?: string;
}