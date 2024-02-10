import { jsonRPC } from '../classes/jsonRPC';
import { Method, Module } from '../classes/module';
import { WSServer } from '../classes/webSocket';
import { IWSClient } from '../types';

@Module('ws')
export default class WebSocketModule {
  @Method('echo')
  public echo(options: { client: IWSClient; socket: WSServer }, message: any) {
    options.client.send(jsonRPC(message?.id ?? -1, 'ws.echo', { ok: true }));
  }
}
