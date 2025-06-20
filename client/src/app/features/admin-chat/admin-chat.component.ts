import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';
import { User } from '../../core/models/user.model';
import {WebSocketService} from '../../core/services/web-socket.service';

interface ChatMessage {
  senderId: number;
  senderEmail: string;
  messageContent: string;
  chatSessionId: string;
  recipientId?: number;
  timestamp: Date;
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

  constructor(private webSocketService: WebSocketService, private authService: AuthService) { }

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

    this.wsSubscription = this.webSocketService.receivedMessages$.subscribe(
      (message: any) => {
        console.log('AdminChatComponent received message (from service):', message);

        if (message.chatSessionId && message.messageContent) {
          const receivedMessage: ChatMessage = {
            senderId: message.senderId,
            senderEmail: message.senderEmail,
            messageContent: message.messageContent,
            chatSessionId: message.chatSessionId,
            recipientId: message.recipientId,
            timestamp: new Date(message.timestamp)
          };
          this.adminMessages.push(receivedMessage);
          this.adminMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        }
      },
      (error: any) => {
        console.error('Admin WebSocket message error:', error);
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

  sendMessage(): void {
    if (this.newMessage.trim() && this.currentAdminId !== null) {
      const lastMessageFromUser = this.adminMessages.find(msg => msg.senderId !== this.currentAdminId);
      const recipientId = lastMessageFromUser ? lastMessageFromUser.senderId : null;
      const chatSessionId = lastMessageFromUser ? lastMessageFromUser.chatSessionId : null;

      if (recipientId !== null && chatSessionId !== null) {
        const adminReply: ChatMessage = {
          senderId: this.currentAdminId,
          senderEmail: this.currentAdminEmail,
          messageContent: this.newMessage.trim(),
          chatSessionId: chatSessionId,
          recipientId: recipientId,
          timestamp: new Date()
        };

        this.webSocketService.sendMessage('/app/chat.sendMessage', adminReply);
        this.newMessage = '';
      } else {
        console.warn('Admin cannot send reply: No user message found to reply to, or recipientId/chatSessionId is missing.');
        alert('Ne možete poslati poruku dok ne primite poruku od korisnika kojoj ćete odgovoriti.');
      }
    }
  }
}
