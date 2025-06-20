import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client;
  private isConnected: boolean = false;

  private _allReceivedMessages: ReplaySubject<any> = new ReplaySubject<any>(100);
  public allReceivedMessages$: Observable<any> = this._allReceivedMessages.asObservable();

  private _unreadAdminMessagesCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public unreadAdminMessagesCount$: Observable<number> = this._unreadAdminMessagesCount.asObservable();

  private processedMessageIds: Set<string> = new Set<string>();

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => {
        return new SockJS(environment.websocketUrl);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('STOMP Debug:', str);
      }
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Povezan na WebSocket (za chat i notifikacije)', frame);
      this.isConnected = true;
      this.processedMessageIds.clear();

      this.stompClient.subscribe('/user/queue/messages', (message: IMessage) => {
        this.processIncomingMessage(message);
      });

      this.stompClient.subscribe('/topic/admin/chat', (message: IMessage) => {
        this.processIncomingMessage(message);
      });
    };

    this.stompClient.onDisconnect = (frame) => {
      console.log('Odjavljen sa WebSocket-a', frame);
      this.isConnected = false;
      this.processedMessageIds.clear();
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
    };

    this.stompClient.activate();
  }

  private processIncomingMessage(message: IMessage): void {
    try {
      const parsedMessage = JSON.parse(message.body);
      const messageIdentifier = `${parsedMessage.chatSessionId}-${parsedMessage.timestamp}-${parsedMessage.senderId}-${parsedMessage.messageContent}`;

      if (this.processedMessageIds.has(messageIdentifier)) {
        console.log('Ignorisanja duplikat poruke:', parsedMessage);
        return;
      }

      this.processedMessageIds.add(messageIdentifier);
      this._allReceivedMessages.next(parsedMessage);

    } catch (e: any) {
      console.error('Greška pri parsiranju poruke:', e, message.body);
    }
  }

  sendMessage(destination: string, message: any): void {
    if (this.stompClient.connected) {
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(message)
      });
    } else {
      console.warn('WebSocket nije povezan. Poruka nije poslata:', message);
    }
  }

  public getMessages(): Observable<any> {
    return this.allReceivedMessages$;
  }

  public resetAdminUnreadMessagesCount(): void {
    this._unreadAdminMessagesCount.next(0);
  }

  closeConnection(): void {
    if (this.stompClient.connected) {
      this.stompClient.deactivate();
      this.isConnected = false;
    }
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}
