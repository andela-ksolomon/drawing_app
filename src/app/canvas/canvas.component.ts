import { Component, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/switchMap';
import { BroadcastService } from '../broadcast.service';
import { WebsocketService } from '../websocket.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-canvas',
  template:
    '<p style="color: green; font-size: 17px; text-align: center;">{{ displayMessage }}</p><canvas #canvas></canvas>',
  styles: ['canvas { border: 1px solid #000; width: 100%; height: 100% }'],
})
export class CanvasComponent implements AfterViewInit {
  displayMessage: string;
  constructor(
    private broadcastService: BroadcastService,
    private wsService: WebsocketService,
    private auth: AuthService,
  ) {}
  @ViewChild('canvas') public canvas: ElementRef;

  @Input() public width = 800;
  @Input() public height = 600;

  private cx: CanvasRenderingContext2D;

  public ngAfterViewInit() {
    const id_token = localStorage.getItem('id_token');
    const send = {
      data: this.auth.getUsername(id_token),
      type: 'user-joined',
    };
    this.broadcastService.sendBroadcast(send);
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    canvasEl.width = this.width;
    canvasEl.height = this.height;

    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';

    this.captureEvents(canvasEl);
    const saveToken = localStorage.getItem('canvas');
    this.wsService.connect().subscribe((message: any) => {
      if (message.type === 'user-joined') {
        this.displayMessage = `${message.data} just joined Yay!`;
        setTimeout(() => {
          this.displayMessage = '';
        }, 3000);
      }
      if (message.type === 'typing' && message.data) {
        this.displayMessage = `${message.data} is typing`;
        setTimeout(() => {
          this.displayMessage = '';
        }, 3000);
      }
      if (message.data && message.type === 'drawing') {
        let self = this;
        let img = new Image();
        img.onload = function() {
          self.cx.drawImage(img, 0, 0);
        };
        img['src'] = message.data;
      }
    });
    if (saveToken) {
      let self = this;
      let img = new Image();
      img.onload = function() {
        self.cx.drawImage(img, 0, 0);
      };
      img['src'] = saveToken;
    }
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    Observable.fromEvent(canvasEl, 'mousedown')
      .switchMap(e => {
        return Observable.fromEvent(canvasEl, 'mousemove')
          .takeUntil(Observable.fromEvent(canvasEl, 'mouseup'))
          .pairwise();
      })
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();

        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top,
        };

        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top,
        };
        let positions = {
          prevPos,
          currentPos,
        };
        localStorage.setItem('canvas', canvasEl.toDataURL('image/png'));
        const data = {
          type: 'drawing',
          data: canvasEl.toDataURL('image/png'),
        };
        const typingData = {
          type: 'typing',
          data: this.auth.getUsername(localStorage.getItem('id_token')),
        };
        this.broadcastService.sendBroadcast(data);
        this.broadcastService.sendBroadcast(typingData);
        this.drawOnCanvas(prevPos, currentPos);
      });
  }

  private drawOnCanvas(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }) {
    if (!this.cx) {
      return;
    }

    this.cx.beginPath();

    if (prevPos) {
      this.cx.moveTo(prevPos.x, prevPos.y); // from
      this.cx.lineTo(currentPos.x, currentPos.y);
      this.cx.stroke();
    }
  }
}
