import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Observable, Subject } from 'rxjs/Rx';

@Injectable()
export class BroadcastService {
  broadcast: Subject<any>;

  // Our constructor calls our wsService connect method
  constructor(private wsService: WebsocketService) {
    this.broadcast = <Subject<any>>wsService.connect().map((response: any): any => {
      return response;
    });
  }

  // Our simplified interface for sending
  // broadcast back to our socket.io server
  sendBroadcast(data) {
    this.broadcast.next(data);
  }
}
