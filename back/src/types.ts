import WebSocket from "ws";
import { Session } from "./session";

export interface ISessionCreateRequest {
  fileName: string;
  fileSize: number;
  destination: number;
}

export interface IBlockReceivedRequest {
  sessionId: number;
  blockId: number;
}

export interface IWSClient extends WebSocket {
  appId: number;
}

export interface IWSServer extends WebSocket.Server {
  sessions: Session[];
  getClients: () => IWSClient[];
}

export interface JsonMessage {
  id: number;
  method: string;
  params: any;
}

export interface BinaryMessage {
  session: Session;
  blockId: number;
  full: Buffer;
}
