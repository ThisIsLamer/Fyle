import * as WebSocket from 'ws';

export class WebSocketServer {
  public static readonly PORT: number = 9090;
  private io: any;

  public constructor() {
    this.sockets();
    this.listen();
  }

  private sockets(): void {
    //const server = createServer(this.app);
    this.io = new WebSocket.Server({ port: 8000 });
  }

  private listen(): void {
    this.io.on('connection', (socket: any) => {
      console.log('Connected client');

      // Try to broadcast a new guest connection message
      let clientNumber = 1;
      this.io.clients.forEach((client: any) => {
        console.log(`Broadcast to client ${clientNumber}`);
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify('Hi all, new client [' + clientNumber + '] was connected'));
        }
        clientNumber++;
      });

      socket.on('message', (message: any) => {
        console.log(JSON.parse(message));
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
}

new WebSocketServer();
