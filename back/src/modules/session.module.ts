import { jsonRPC, jsonRPCError } from '../classes/jsonRPC';
import { Method, Module } from '../classes/module';
import { WSServer } from '../classes/webSocket';
import { BinaryMessage, IBlockReceivedRequest, ISession, ISessionCreateRequest, IWSClient } from '../types';

@Module('session')
export default class SessionModule {
  @Method('create')
  public create(options: { client: IWSClient; socket: WSServer }, message: any) {
    const params = message?.params as ISessionCreateRequest;

    const destination = options.socket.getClients().find((_: IWSClient) => _.appId === params.destination);
    if (!destination) {
      options.client.send(
        jsonRPCError(message?.id ?? -1, 'ws.create', {
          code: 0,
          description: 'Destination client not found',
        }),
      );
      return;
    }

    const blockSize = 2 * 1024 ** 2;

    const session: ISession = {
      id: Math.floor(Math.random() * 2 ** 32),
      fileName: params.fileName,
      fileSize: params.fileSize,
      blockSize: blockSize, // 2 Mb
      blockCount: Math.ceil(params.fileSize / blockSize),
      blockReceived: -1,
      blockReceivedAck: 0,
      blockTransmitted: 0,
      blockTransmittedAck: 0,
      blockWindow: 20,
      pauseReceiving: false,
      source: options.client,
      destination: destination,
      transferBlock: function (block: BinaryMessage) {
        if (this.blockTransmitted - this.blockTransmittedAck > this.blockWindow) {
          this.pauseReceiving = true;
          this.onSessionChanged('src');
        }

        this.blockTransmitted = block.blockId;
        this.destination.send(block.full, { binary: true });
      },
      onAckReceived: function (blockId: number) {
        if (blockId > this.blockTransmitted) {
          console.error(`out of order ack ${blockId} > ${this.blockTransmitted} in ${session.id}`);
          return;
        }
        this.blockTransmittedAck = blockId;

        const oldPaused = this.pauseReceiving;
        this.pauseReceiving = this.blockTransmitted - this.blockTransmittedAck > this.blockWindow / 2;

        if (oldPaused !== this.pauseReceiving) {
          this.onSessionChanged('src');
        }
      },
      print: function () {
        console.log(
          Object.keys(this).map((k) => {
            if (k === 'source' || k == 'destination') return { k: '' };
            // @ts-ignore
            return { k: k, v: this[k] };
          }),
        );
      },
      onSessionChanged: function (notify: 'src' | 'dst' | 'all') {
        this.print();

        if (notify === 'src' || notify === 'all') {
          this.source.send(
            JSON.stringify({
              id: -1,
              method: '_sessionChanged',
              result: {
                session: {
                  pauseReceiving: session.pauseReceiving,
                  blockReceived: session.blockReceived,
                  blockReceivedAck: session.blockReceivedAck,
                  blockWindow: session.blockWindow,
                },
              },
            }),
          );
        }

        if (notify === 'dst' || notify === 'all') {
          this.destination.send(
            JSON.stringify({
              id: -1,
              method: '_sessionChanged',
              result: {
                session: {
                  blockTransmittedAck: session.blockTransmittedAck,
                  blockWindow: session.blockWindow,
                },
              },
            }),
          );
        }
      },
    };

    session.print();
    options.socket.sessions.push(session);

    destination.send(
      jsonRPC(message?.id ?? -1, '_session.create', {
        session: {
          id: session.id,
          fileName: params.fileName,
          fileSize: params.fileSize,
          blockCount: session.blockCount,
          blockTransmitted: session.blockTransmitted,
          blockTransmittedAck: session.blockTransmittedAck,
        },
      }),
    );

    options.client.send(
      jsonRPC(message?.id ?? -1, message.method, {
        session: {
          id: session.id,
          blockSize: blockSize,
          blockCount: session.blockCount,
          blockWindow: 20,
          blockReceived: session.blockReceived,
          blockReceivedAck: session.blockReceivedAck,
          pauseReceiving: session.pauseReceiving,
        },
      }),
    );
  }

  @Method('received')
  public received(options: { client: IWSClient; socket: WSServer }, message: any) {
    const params = message.params as IBlockReceivedRequest;

    const session = options.socket.sessions.find((_: ISession) => _.id === params.sessionId);
    if (!session) {
      options.client.send(
        jsonRPCError(message?.id ?? -1, message.method, {
          code: 0,
          description: `Session ${params?.sessionId} not found`,
        }),
      );

      return;
    }

    session.onAckReceived(params.blockId);
  }
}
