import WebSocket from "ws";
import {
  BinaryMessage,
  IBlockReceivedRequest,
  ISession,
  ISessionCreateRequest,
  IWSClient,
  IWSServer,
  JsonMessage
} from "./types";

export class WebSocketServer {
  private socket: IWSServer;

  public constructor() {
    const server: WebSocket.Server = new WebSocket.Server({ port: 8000 });
    this.socket = (server as any);
    this.socket.sessions = [];
    this.socket.getClients = () => (Array.from(this.socket.clients) as any);

    this.socket.on('connection', (client: WebSocket) => {
      this.onClientConnected((client as any));
    });
    console.log('Started server');
  }

  private onGenericMessage(client: IWSClient, message: Buffer, isBinary: boolean) {
    if (isBinary) {

      let sessionId = message.readUint32BE(0)
      let blockId = message.readUint32BE(4)
      let data = message

      let session = this.socket.sessions.find(_ => _.id == sessionId);
      if (!session) {
        console.log(`Session ID ${sessionId} not found`)
        client.close()
        return;
      }

      console.log('Received data', client.appId, sessionId, blockId, data);

      this.onClientData(client, { session, blockId, full: message });
    } else {
      let jsonMessage: JsonMessage = JSON.parse((message as any));
      console.log('Received json', client.appId, jsonMessage);
      this.onClientMessage(client, jsonMessage);
    }
  }

  private onClientConnected(client: IWSClient) {
    client.appId = Math.floor(Math.random() * 2 ** 32);
    console.log(`Client ID ${client.appId} connected`);

    client.on('message', (message: Buffer, isBinary: boolean) => {
      this.onGenericMessage(client, message, isBinary);
    });

    // noinspection JSUnusedLocalSymbols
    client.on('close', (code: number, reason: Buffer) => {
      console.log(`Client ID ${client.appId} disconnected`);

      this.socket.sessions
        .filter(_ => _.destination == client || _.source == client)
        .map(_ => this.socket.sessions
          .splice(this.socket.sessions.indexOf(_), 1)
        )
    })

    client.send(JSON.stringify({
      id: -1,
      method: '_bootstrap',
      result: {
        clientId: client.appId,
      }
    }))
  }

  private onClientMessage(client: IWSClient, message: JsonMessage) {
    let method = message.method;

    if (method === 'createSession') {
      let data: ISessionCreateRequest = message.params;

      let destination = this.socket.getClients().find(_ => _.appId === data.destination)
      if (!destination) {
        client.send(JSON.stringify({
          id: message.id,
          error: {
            code: 0,
            description: 'Destination client not found'
          }
        }))
        return;
      }

      let blockSize = Math.ceil(0.5 * 1024 * 1024);

      let session: ISession = {
        id: Math.floor(Math.random() * 2 ** 32),
        fileName: data.fileName,
        fileSize: data.fileSize,
        blockSize: blockSize, // 2 Mb
        blockCount: Math.ceil(data.fileSize / blockSize),
        blockReceived: -1,
        blockReceivedAck: 0,
        blockTransmitted: 0,
        blockTransmittedAck: 0,
        blockWindow: 20,
        pauseReceiving: false,
        source: client,
        destination: destination,
        transferBlock: function(block: BinaryMessage) {
          if (this.blockTransmitted - this.blockTransmittedAck > this.blockWindow) {
            this.pauseReceiving = true;
            this.onSessionChanged('src');
          }

          this.blockTransmitted = block.blockId;
          this.destination.send(block.full, {binary: true})
        },
        onAckReceived: function(blockId: number) {
          if (blockId > this.blockTransmitted) {
            console.error(`out of order ack ${blockId} > ${this.blockTransmitted} in ${session.id}`);
            return;
          }
          this.blockTransmittedAck = blockId;

          let oldPaused = this.pauseReceiving;
          this.pauseReceiving = this.blockTransmitted - this.blockTransmittedAck > this.blockWindow / 2;

          if (oldPaused !== this.pauseReceiving) {
            this.onSessionChanged('src');
          }
        },
        print: function() {
          console.log(Object.keys(this).map(k => {
            if (k === 'source' || k == 'destination') return {k: ''}
            // @ts-ignore
            return {k: k, v: this[k]}
          }))
        },
        onSessionChanged: function(notify: 'src' | 'dst' | 'all') {
          this.print();

          if (notify === 'src' || notify === 'all') {
            this.source.send(JSON.stringify({
              id: -1,
              method: '_sessionChanged',
              result: {
                session: {
                  pauseReceiving: session.pauseReceiving,
                  blockReceived: session.blockReceived,
                  blockReceivedAck: session.blockReceivedAck,
                  blockWindow: session.blockWindow,
                }
              }
            }))
          }

          if (notify === 'dst' || notify === 'all') {
            this.destination.send(JSON.stringify({
              id: -1,
              method: '_sessionChanged',
              result: {
                session: {
                  blockTransmittedAck: session.blockTransmittedAck,
                  blockWindow: session.blockWindow,
                }
              }
            }))
          }
        }
      }
      session.print();
      this.socket.sessions.push(session);

      destination.send(JSON.stringify({
        id: -1,
        method: '_sessionCreated',
        result: {
          session: {
            id: session.id,
            fileName: data.fileName,
            fileSize: data.fileSize,
            blockWindow: session.blockWindow,
            blockCount: session.blockCount,
            blockTransmitted: session.blockTransmitted,
            blockTransmittedAck: session.blockTransmittedAck,
          }
        }
      }));

      client.send(JSON.stringify({
        id: message.id,
        method: method,
        result: {
          session: {
            id: session.id,
            blockSize: blockSize,
            blockCount: session.blockCount,
            blockWindow: 20,
            blockReceived: session.blockReceived,
            blockReceivedAck: session.blockReceivedAck,
            pauseReceiving: session.pauseReceiving,
          }
        }
      }));
    }

    if (method === 'blockReceived') {
      let data: IBlockReceivedRequest = message.params;

      let session = this.socket.sessions.find(_ => _.id === data.sessionId);
      if (!session) {
        client.send(JSON.stringify({
          id: message.id,
          error: {
            code: 0,
            description: `Session ${data.sessionId} not found`,
          }
        }))
        return;
      }

      if (data.blockId === session.blockCount) {
        console.log(`All block transferred on session ${session.id}`)
      }

      session.onAckReceived(data.blockId);
    }
  }

  private onClientData(client: IWSClient, block: BinaryMessage) {
    if (block.blockId !== (block.session.blockReceived + 1)) {
      console.error(`out of order block ${block.blockId} in ${block.session.id}; client ${client.appId}`)
      return;
    }

    block.session.blockReceived += 1;

    // если разница блоков отмеченных и принятых более половины window = отправлять ack клиенту
    if (block.session.blockReceived - block.session.blockReceivedAck > block.session.blockWindow / 2) {
      block.session.blockReceivedAck = block.session.blockReceived;
      block.session.onSessionChanged('src');
    }

    block.session.transferBlock(block);
  }
}

new WebSocketServer();
