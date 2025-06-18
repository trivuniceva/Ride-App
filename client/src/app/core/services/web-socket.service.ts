import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient!: Client;
  private readonly socketUrl = 'http://localhost:8080/ws';

  connect(driverId: number, onMessage: (notification: any) => void): void {
    const socket = new SockJS(this.socketUrl);

    this.stompClient = new Client({
      webSocketFactory: () => socket as WebSocket,
      reconnectDelay: 5000,
      onConnect: () => {
        this.stompClient.subscribe(`/topic/driver/${driverId}`, (message: IMessage) => {
          if (message.body) {
            try {
              const notification = JSON.parse(message.body);
              localStorage.setItem('currentRideNotification', JSON.stringify(notification));
              onMessage(notification);
            } catch (e) {
              console.error('Ne mogu da parsiram rideRequest:', e);
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP greška:', frame);
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
