import WebSocket from "ws";

export interface ISession {
  id: number;
  fileName: string;
  fileSize: number;
  blockSize: number;
  blockCount: number;
  blockReceived: number;
  blockReceivedAck: number;
  blockTransmitted: number;
  blockTransmittedAck: number;
  blockWindow: number;
  pauseReceiving: boolean;
  source: IWSClient;
  destination: IWSClient;
  transferBlock: (block: BinaryMessage) => void;
  onAckReceived: (blockId: number) => void;
  onSessionChanged: (notify: "src" | "dst" | "all") => void;
  print: () => void;
}

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
  sessions: ISession[];
  getClients: () => IWSClient[];
}

export interface JsonMessage {
  id: number;
  method: string;
  params: any;
}

export interface BinaryMessage {
  session: ISession;
  blockId: number;
  full: Buffer;
}
