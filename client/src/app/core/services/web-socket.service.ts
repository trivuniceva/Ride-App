// src/app/core/services/web-socket.service.ts

import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Observable, ReplaySubject, BehaviorSubject, Subject } from 'rxjs'; // Dodao Subject za waitOnConnect$
import SockJS from 'sockjs-client/dist/sockjs';
import { environment } from '../../../environments/environment';
import { take, filter } from 'rxjs/operators'; // Dodao take i filter

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client;
  private isConnected: boolean = false;
  // Dodatni Subject koji će emitovati kada je konekcija uspostavljena
  private connectionEstablished$: Subject<void> = new Subject<void>();


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
      this.connectionEstablished$.next(); // Emituj događaj da je konekcija uspostavljena

      this.stompClient.subscribe('/user/queue/messages', (message: IMessage) => {
        this.processIncomingMessage(message);
      });

      this.stompClient.subscribe('/topic/admin/chat', (message: IMessage) => {
        this.processIncomingMessage(message);
      });

      this.stompClient.subscribe('/topic/ride-requests', (message: IMessage) => {
        console.log('Received message on /topic/ride-requests');
        this.processIncomingMessage(message);
      });
    };

    this.stompClient.onDisconnect = (frame) => {
      console.log('Odjavljen sa WebSocket-a', frame);
      this.isConnected = false;
      // Ne emitujemo na connectionEstablished$ ovde, jer se to koristi za inicijalnu pretplatu.
      // Resetujemo ga tek na sledećem aktiviranju stompClienta ako je potrebno
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
      // Ne ažuriramo isConnected ovde direktno, onDisconnect će se verovatno pozvati
    };

    this.stompClient.activate();
  }

  private processIncomingMessage(message: IMessage): void {
    try {
      console.log('Raw WebSocket message body:', message.body);
      const parsedMessage = JSON.parse(message.body);
      console.log('Received WebSocket message (parsed):', parsedMessage);

      // Koristimo message-id ako postoji za dedup, inače fallback na kombinaciju
      const messageIdentifier = message.headers['message-id'] ||
        `${parsedMessage.chatSessionId || ''}-${parsedMessage.timestamp || ''}-${parsedMessage.senderId || ''}-${parsedMessage.messageContent || ''}`;

      if (this.processedMessageIds.has(messageIdentifier)) {
        console.log('Ignoring duplicate message:', parsedMessage);
        return;
      }

      this.processedMessageIds.add(messageIdentifier);
      this._allReceivedMessages.next(parsedMessage);

    } catch (e: any) {
      console.error('Error parsing message:', e, message.body);
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
    console.log("---------   *** --------- (( ---------");
    console.log(this.allReceivedMessages$);
    return this.allReceivedMessages$;
  }

  public subscribeToUserTopic(userId: number): Observable<any> {
    const topic = `/user/${userId}/queue/ride-updates`;
    console.log(`Povezivanje na WebSocket topic: ${topic}`);

    return new Observable(observer => {
      let stompSubscription: StompSubscription | null = null;

      const subscribe = () => {
        stompSubscription = this.stompClient.subscribe(topic, (message: IMessage) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            console.log(`Received message on ${topic}:`, parsedMessage); // Dodatni log
            observer.next(parsedMessage);
          } catch (e) {
            console.error('Failed to parse WebSocket message body in user topic:', e, message.body);
            observer.error(e);
          }
        });
        console.log(`Uspešno pretplaćen na ${topic}`); // Potvrdni log
      };

      if (this.isConnected) {
        // Ako je već povezan, odmah se pretplati
        subscribe();
      } else {
        // Ako nije povezan, čekaj da se konekcija uspostavi
        console.log(`WebSocket nije povezan. Čekam uspostavljanje veze pre pretplate na korisničku temu ${topic}.`);
        this.connectionEstablished$.pipe(
          take(1) // Uzmi samo prvi put kada se veza uspostavi
        ).subscribe(() => {
          subscribe(); // Kada se veza uspostavi, pretplati se
        });
      }

      // Funkcija za čišćenje kada se Angular Observable odjavi
      return () => {
        if (stompSubscription && this.stompClient.connected) {
          stompSubscription.unsubscribe();
          console.log(`Unsubscribed from ${topic}`);
        }
      };
    });
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
