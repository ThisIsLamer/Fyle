import { Inject } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import Redis from "ioredis";
import { Server } from 'socket.io';
import { FileService } from "./file.service";
import { Processed, ProcessedPayload } from "src/utils/default";
import { IUploadFile } from "./dto/file.dto";

@WebSocketGateway({ cors: true })
export class FileGateway {
  constructor(
    private readonly fileService: FileService,

    @Inject('REDIS') private readonly redis: Redis,
  ) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('file-upload')
  async handleUploadFile(@ProcessedPayload() processed: Processed<IUploadFile>) {
    const { targetClient, payload } = processed;
    const loadedUser = await this.redis.get(targetClient.id);
    if (!loadedUser) 
      return targetClient.emit('file-upload', { success: false, message: 'You are not authorized' });

    this.fileService.streamFile(loadedUser, payload);
  }
}