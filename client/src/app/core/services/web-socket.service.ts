import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient!: Client;
  private readonly socketUrl = 'http://localhost:8080/ws';

  connect(driverId: number, onMessage: (msg: string) => void): void {
    const socket = new SockJS(this.socketUrl);

    this.stompClient = new Client({
      webSocketFactory: () => socket as WebSocket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ WebSocket connected');
        this.stompClient.subscribe(`/topic/driver/${driverId}`, (message: IMessage) => {
          if (message.body) {
            console.log("📩 Primljena poruka:", message.body);
            onMessage(message.body);
          }
        });
      },
      onStompError: (frame) => {
        console.error('❌ STOMP greška:', frame);
      }
    });

    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}
