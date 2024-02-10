import WebSocket from 'ws';
import { ISession, IWSClient } from '../types';

import { jsonRPC } from './jsonRPC';

import { logger } from './logger';
import { Registry } from './module';

export class WSServer extends WebSocket.Server {
  public sessions: ISession[] = [];
  public getClients = () => [...this.clients];
}

export class WebSocketServer {
  private socket: WSServer;

  constructor() {
    this.socket = new WSServer({ port: Number(process.env.PORT) });

    this.init();
  }

  private init() {
    this.onStartSessionClient();
  }

  private onStartSessionClient() {
    this.socket.on('connection', (client: IWSClient) => {
      client.appId = Math.floor(Math.random() * 2 ** 32);
      logger.info(`Client ID ${client.appId} connected`);

      client.send(jsonRPC(-1, '_bootstrap', { clientId: client.appId }));

      this.onClientMessage(client);
      this.onClientDisconnected(client);
    });
  }

  private onClientMessage(client: IWSClient) {
    client.on('message', (message: Buffer, isBinary: boolean) => {
      if (isBinary) {
        this.loadMethod(client, 'transfer.binary', message);
      }
      const jsonMessage = JSON.parse(message.toString());
      logger.info(`Received json: ${client.appId} ${JSON.stringify(jsonMessage)}`);

      this.loadMethod(client, jsonMessage?.method, message);
    });
  }

  private onClientDisconnected(client: IWSClient) {
    client.on('close', (client: any) => {
      logger.info(`Client ID ${client.appId} disconnected`);

      const sessionIndex = this.socket.sessions.findIndex(
        (_) => _.destination === client || _.source === client,
      );
      if (sessionIndex !== -1) this.socket.sessions.splice(sessionIndex, 1);
    });
  }

  private loadMethod(client: IWSClient, method: string, message: Buffer) {
    const arrayMethod = method.split('.');
    const moduleName = arrayMethod[0];

    arrayMethod.splice(0, 1);
    const methodName = arrayMethod.join('.');

    const loadedModule = Registry.modules.get(moduleName);
    if (!loadedModule) return logger.error('Error load module: transfer');
    const loadedMethod = loadedModule.get(methodName);
    if (!loadedMethod) return logger.error('Error load method binary');
    loadedMethod({ client, socket: this.socket }, message);
  }
}
