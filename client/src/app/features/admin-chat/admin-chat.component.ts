// admin-chat.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';
import { User } from '../../core/models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { WebSocketService } from '../../core/services/web-socket.service';

interface ChatMessage {
  senderId: number;
  senderEmail: string;
  messageContent: string;
  chatSessionId: string;
  recipientId?: number | null;
  timestamp: Date;
}

interface ChatSessionDetail {
  sessionId: string;
  lastMessageContent: string;
  lastSenderEmail: string;
  timestamp: Date;
  lastSenderId: number;
  unreadCount: number;
}

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-chat.component.html',
  styleUrls: ['./admin-chat.component.css']
})
export class AdminChatComponent implements OnInit, OnDestroy {
  adminMessages: ChatMessage[] = [];
  newMessage: string = '';
  private wsSubscription: Subscription | undefined;
  private authSubscription: Subscription | undefined;
  currentAdminId: number | null = null;
  currentAdminEmail: string = '';

  chatSessions: ChatSessionDetail[] = [];
  selectedChatSessionId: string | null = null;
  selectedRecipientId: number | null = null;
  selectedRecipientEmail: string | null = null;

  constructor(
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.loggedUser$.subscribe((user: User | null) => {
      if (user && user.id && user.email && user.userRole === 'ADMINISTRATOR') {
        this.currentAdminId = user.id;
        this.currentAdminEmail = user.email;
      } else {
        this.currentAdminId = null;
        this.currentAdminEmail = 'Nije Ulogovan Admin';
      }
    });

    this.loadAllChatSessionDetails();

    this.wsSubscription = this.webSocketService.allReceivedMessages$.subscribe(
      (message: any) => {
        if (message.chatSessionId && message.messageContent) {
          this.updateChatSessionsOnNewMessage(message);

          if (this.selectedChatSessionId === message.chatSessionId) {
            const receivedMessage: ChatMessage = {
              senderId: message.senderId,
              senderEmail: message.senderEmail,
              messageContent: message.messageContent,
              chatSessionId: message.chatSessionId,
              recipientId: message.recipientId,
              timestamp: new Date(message.timestamp)
            };

            if (!this.adminMessages.some(m =>
              m.timestamp.getTime() === receivedMessage.timestamp.getTime() &&
              m.senderId === receivedMessage.senderId &&
              m.messageContent === receivedMessage.messageContent
            )) {
              this.adminMessages.push(receivedMessage);
              this.adminMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            }
          }
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadAllChatSessionDetails(): void {
    this.http.get<ChatSessionDetail[]>(`${environment.backendUrl}/api/chat/session-details`).subscribe(
      details => {
        this.chatSessions = details.map(detail => ({
          ...detail,
          timestamp: new Date(detail.timestamp),
          unreadCount: 0
        }));
        this.sortChatSessions();
      }
    );
  }

  updateChatSessionsOnNewMessage(newMessage: ChatMessage): void {
    let sessionFound = false;
    for (let session of this.chatSessions) {
      if (session.sessionId === newMessage.chatSessionId) {
        session.lastMessageContent = newMessage.messageContent;
        session.lastSenderEmail = newMessage.senderEmail;
        session.timestamp = new Date(newMessage.timestamp);
        session.lastSenderId = newMessage.senderId;

        if (this.selectedChatSessionId !== newMessage.chatSessionId && newMessage.senderId !== this.currentAdminId) {
          session.unreadCount++;
        }
        sessionFound = true;
        break;
      }
    }
    if (!sessionFound) {
      this.chatSessions.push({
        sessionId: newMessage.chatSessionId,
        lastMessageContent: newMessage.messageContent,
        lastSenderEmail: newMessage.senderEmail,
        timestamp: new Date(newMessage.timestamp),
        lastSenderId: newMessage.senderId,
        unreadCount: (newMessage.senderId !== this.currentAdminId) ? 1 : 0
      });
    }
    this.sortChatSessions();
  }

  sortChatSessions(): void {
    this.chatSessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  selectChatSession(sessionId: string): void {
    this.selectedChatSessionId = sessionId;
    this.adminMessages = [];

    const selectedSession = this.chatSessions.find(s => s.sessionId === sessionId);
    if (selectedSession) {
      selectedSession.unreadCount = 0;

      this.http.get<ChatMessage[]>(`${environment.backendUrl}/api/chat/messages/${sessionId}`).subscribe(
        messages => {
          const userMessage = messages.find(msg => msg.senderEmail !== this.currentAdminEmail);
          if (userMessage) {
            this.selectedRecipientId = userMessage.senderId;
            this.selectedRecipientEmail = userMessage.senderEmail;
          } else {
            this.selectedRecipientId = null;
            this.selectedRecipientEmail = 'Nepoznat Korisnik';
          }
        }
      );
    }

    this.http.get<ChatMessage[]>(`${environment.backendUrl}/api/chat/messages/${sessionId}`).subscribe(
      messages => {
        this.adminMessages = messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        this.adminMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      }
    );
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.currentAdminId !== null && this.selectedChatSessionId !== null && this.selectedRecipientId !== null) {
      const adminReply: ChatMessage = {
        senderId: this.currentAdminId,
        senderEmail: this.currentAdminEmail,
        messageContent: this.newMessage.trim(),
        chatSessionId: this.selectedChatSessionId,
        recipientId: this.selectedRecipientId,
        timestamp: new Date()
      };

      this.webSocketService.sendMessage('/app/chat.sendMessage', adminReply);
      this.newMessage = '';
    }
  }
}
