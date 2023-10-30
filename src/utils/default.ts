import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';

export interface Processed<T> {
  targetClient: Socket;
  payload?: T;
}

export const ProcessedPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const targetClient: Socket = ctx.switchToWs().getClient();
    let payload: string | object = ctx.getArgByIndex(1);
    
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (e) { payload = null }
    }
    
    return { targetClient, payload };
  },
);
