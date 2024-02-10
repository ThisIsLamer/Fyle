import { BinaryMessage, IWSClient } from "./types";

export class Session {
  public id: number;
  public fileName: string;
  public fileSize: number;
  public blockSize: number;
  public blockCount: number;
  public blockReceived: number;
  public blockReceivedAck: number;
  public blockTransmitted: number;
  public blockTransmittedAck: number;
  public blockWindow: number;
  public pauseReceiving: boolean;
  public source: IWSClient;
  public destination: IWSClient;
  public success: boolean;

  public constructor(fileName: string, fileSize: number, blockSize: number, source: IWSClient, destination: IWSClient) {
    this.id = Math.floor(Math.random() * 2 ** 32);
    this.fileName = fileName;
    this.fileSize = fileSize;
    this.source = source;
    this.destination = destination;
    this.blockSize = blockSize;
    this.blockCount = Math.ceil(this.fileSize / blockSize);
    this.blockReceived = -1;
    this.blockReceivedAck = 0;
    this.blockTransmitted = 0;
    this.blockTransmittedAck = 0;
    this.blockWindow = 20;
    this.pauseReceiving = false;
    this.success = false;
  }

  public transferBlock(block: BinaryMessage) {
    if (this.blockTransmitted - this.blockTransmittedAck > this.blockWindow) {
      this.pauseReceiving = true;
      this.onSessionChanged('src');
    }

    this.blockTransmitted = block.blockId;
    this.destination.send(block.full, {binary: true})
  }

  public onAckReceived(blockId: number) {
    if (blockId > this.blockTransmitted) {
      console.error(`out of order ack ${blockId} > ${this.blockTransmitted} in ${this.id}`);
      return;
    }
    this.blockTransmittedAck = blockId;

    let oldPaused = this.pauseReceiving;
    this.pauseReceiving = this.blockTransmitted - this.blockTransmittedAck > this.blockWindow / 2;

    if (oldPaused !== this.pauseReceiving) {
      this.onSessionChanged('src');
    }

    if (blockId === this.blockCount) {
      this.success = true;
      this.onSessionChanged('all');
    }
  }

  public print() {
    console.log(Object.keys(this).map(k => {
      if (k === 'source' || k === 'destination') return {k: ''}
      // @ts-ignore
      return {k: k, v: this[k]}
    }))
  }

  public onSessionChanged(notify: 'src' | 'dst' | 'all') {
    // this.print();

    if (notify === 'src' || notify === 'all') {
      this.source.send(JSON.stringify({
        id: -1,
        method: '_sessionChanged',
        result: {
          session: {
            pauseReceiving: this.pauseReceiving,
            blockReceived: this.blockReceived,
            blockReceivedAck: this.blockReceivedAck,
            blockWindow: this.blockWindow,
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
            blockTransmittedAck: this.blockTransmittedAck,
            blockWindow: this.blockWindow,
          }
        }
      }))
    }
  }
}
