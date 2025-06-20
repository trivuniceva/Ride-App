import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatWindowService {
  private showChatSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public showChat$: Observable<boolean> = this.showChatSubject.asObservable();

  private chatSessionIdSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public chatSessionId$: Observable<string | null> = this.chatSessionIdSubject.asObservable();

  constructor() { }

  openChat(sessionId: string | null = null): void {
    this.chatSessionIdSubject.next(sessionId);
    this.showChatSubject.next(true);
  }

  closeChat(): void {
    this.showChatSubject.next(false);
    this.chatSessionIdSubject.next(null);
  }
}
