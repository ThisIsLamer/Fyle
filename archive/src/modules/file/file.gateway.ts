import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { FileService } from "./file.service";
import { Processed, ProcessedPayload } from "src/classes/utils/default";
import { IRegisterFile } from "./dto/file.dto";
import { AuthService } from "../auth/auth.service";

@WebSocketGateway({ cors: true, maxHttpBufferSize: 5e6 })
export class FileGateway {
  constructor(
    private readonly fileService: FileService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('registerFile')
  async handleRegisterFile(@ProcessedPayload() processed: Processed<IRegisterFile>) {
    const { targetClient, payload } = processed;
    const loadedUser = await this.authService.checkAuth('registerFile', targetClient);

    const loadedFile = await this.fileService.registerFile(
      loadedUser,
      payload.filename,
      payload.mimetype,
      payload.totalSize,
    );

    targetClient.emit('registerFile', { ...loadedFile, id: payload.id });
  }

  sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  @SubscribeMessage('uploadBlock')
  async handleFileBlock(
    @MessageBody() data: ArrayBuffer,
    @ConnectedSocket() client: Socket
  ) {
    const targetClient = this.server.sockets.sockets.get(client.id);

    const tokenSize = 48;
    const blockSize = 8;
    const jsonSize = tokenSize + blockSize + 31 ;
    
    const jsonString = new TextDecoder().decode(data.slice(0, jsonSize));
    const metadata = JSON.parse(jsonString);
  
    const binaryBlock = data.slice(jsonSize);

    const loadedFile = await this.fileService
      .appendToFile(metadata.token, Number(metadata.blockIndex), new Uint8Array(binaryBlock));
    
    targetClient.emit('uploadBlock', loadedFile);

    console.log(process.memoryUsage().rss / (1024 * 1024));
  }
}