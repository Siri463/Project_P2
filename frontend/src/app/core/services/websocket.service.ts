import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

declare const SockJS: any;
declare const Stomp: any;

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any;
  private connected = false;
  
  seatUpdates$ = new Subject<any>();

  connect(showId: number) {
    if (this.connected) return;

    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);
    
    this.stompClient.connect({}, () => {
      this.connected = true;
      this.stompClient.subscribe(`/topic/seats/${showId}`, (message: any) => {
        const update = JSON.parse(message.body);
        this.seatUpdates$.next(update);
      });
    });
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      this.stompClient.disconnect();
      this.connected = false;
    }
  }
}
