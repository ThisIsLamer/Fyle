import { logger } from '../classes/logger';
import { Method, Module } from '../classes/module';
import { WSServer } from '../classes/webSocket';
import { IWSClient } from '../types';

@Module('transfer')
export default class TransferModule {
  @Method('binary')
  public transfer(options: { client: IWSClient; socket: WSServer }, message: Buffer) {
    const sessionId = message.readUint32BE(0);
    const blockId = message.readUint32BE(4);

    const session = options.socket.sessions.find((_) => _.id === sessionId);
    if (!session) {
      logger.info(`Session ID $${sessionId} not found`);
      options.client.close();
      return;
    }

    logger.debug(
      `Received data: [clientId: ${options.client.appId}] [sessionId: ${sessionId}] [blockId: ${blockId}]`,
    );

    if (blockId !== session.blockReceived + 1) {
      logger.error(`Out of order block ${blockId} in ${session.id}; client ${options.client.appId}`);
      return;
    }

    session.blockReceived += 1;

    if (session.blockReceived - session.blockReceivedAck > session.blockWindow / 2) {
      session.blockReceivedAck = session.blockReceived;
      session.onSessionChanged('src');
    }

    session.transferBlock({ session, blockId, full: message });

    return 'da';
  }
}
