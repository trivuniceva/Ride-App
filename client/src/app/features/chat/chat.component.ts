import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';
import { User } from '../../core/models/user.model';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../core/services/web-socket.service';

interface ChatMessage {
  senderId: number;
  senderEmail: string;
  messageContent: string;
  chatSessionId: string;
  recipientId?: number | null;
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() chatSessionId: string | null = null;

  messages: ChatMessage[] = [];
  newMessage: string = '';
  currentUserId: number | null = null;
  currentUserEmail: string = '';
  private authSubscription: Subscription | undefined;
  private wsSubscription: Subscription | undefined;

  constructor(
    private webSocketService: WebSocketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.loggedUser$.subscribe((user: User | null) => {
      if (user && user.id && user.email) {
        this.currentUserId = user.id;
        this.currentUserEmail = user.email;
        if (!this.chatSessionId) {
          this.chatSessionId = user.email;
        }
      } else {
        this.currentUserId = null;
        this.currentUserEmail = 'Gost';
        if (!this.chatSessionId) {
          this.chatSessionId = 'guest_chat_' + Date.now();
        }
      }

      if (this.currentUserId !== null) {
        this.setupWebSocketListener();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  private setupWebSocketListener(): void {
    this.wsSubscription = this.webSocketService.allReceivedMessages$.subscribe(
      (message: any) => {
        if (message.chatSessionId === this.chatSessionId) {
          const receivedMessage: ChatMessage = {
            senderId: message.senderId,
            senderEmail: message.senderEmail,
            messageContent: message.messageContent,
            chatSessionId: message.chatSessionId,
            recipientId: message.recipientId,
            timestamp: new Date(message.timestamp)
          };

          if (!this.messages.some(m =>
            m.timestamp.getTime() === receivedMessage.timestamp.getTime() &&
            m.senderId === receivedMessage.senderId &&
            m.messageContent === receivedMessage.messageContent
          )) {
            this.messages.push(receivedMessage);
            this.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          }
        }
      }
    );
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.currentUserId !== null && this.currentUserEmail && this.chatSessionId) {
      const messageToSend: ChatMessage = {
        senderId: this.currentUserId,
        senderEmail: this.currentUserEmail,
        messageContent: this.newMessage.trim(),
        chatSessionId: this.chatSessionId,
        recipientId: null,
        timestamp: new Date()
      };

      this.webSocketService.sendMessage('/app/chat.sendMessage', messageToSend);
      this.newMessage = '';
    }
  }
}
