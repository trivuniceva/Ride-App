import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Subject, Observable, ReplaySubject, BehaviorSubject } from 'rxjs';
import SockJS from 'sockjs-client/dist/sockjs';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client;
  private messageSubject: Subject<any>;
  private subscription: StompSubscription | null = null;
  private isConnected: boolean = false;

  private _receivedMessages: ReplaySubject<any> = new ReplaySubject<any>();
  public receivedMessages$: Observable<any> = this._receivedMessages.asObservable();

  private _unreadAdminMessagesCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public unreadAdminMessagesCount$: Observable<number> = this._unreadAdminMessagesCount.asObservable();

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

    this.messageSubject = new Subject<any>();

    this.stompClient.onConnect = (frame) => {
      console.log('Povezan na WebSocket (za chat i notifikacije)', frame);
      this.isConnected = true;

      this.subscription = this.stompClient.subscribe('/user/queue/messages', (message: IMessage) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          this.messageSubject.next(parsedMessage);
          this._receivedMessages.next(parsedMessage);
        } catch (e: any) {
          console.error('Greška pri parsiranju poruke na /user/queue/messages:', e, message.body);
        }
      });

      this.stompClient.subscribe('/topic/admin/chat', (message: IMessage) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          this.messageSubject.next(parsedMessage);
          this._receivedMessages.next(parsedMessage);

          if (parsedMessage.senderEmail !== 'admin@rideapp.com') {
            this._unreadAdminMessagesCount.next(this._unreadAdminMessagesCount.getValue() + 1);
          }
        } catch (e: any) {
          console.error('Greška pri parsiranju poruke na /topic/admin/chat:', e, message.body);
        }
      });
    };

    this.stompClient.onDisconnect = (frame) => {
      console.log('Odjavljen sa WebSocket-a', frame);
      this.isConnected = false;
      this.subscription?.unsubscribe();
      this.subscription = null;
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
    };

    this.stompClient.activate();
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

  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  public emitMessageToComponents(message: any): void {
    this._receivedMessages.next(message);
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

  public resetAdminUnreadMessagesCount(): void {
    this._unreadAdminMessagesCount.next(0);
  }
}
