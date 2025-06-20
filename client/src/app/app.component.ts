import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { NgIf } from '@angular/common';
import { ChatComponent } from "./features/chat/chat.component";
import { Subscription } from 'rxjs';
import { ChatWindowService } from './core/services/chat/chat-window.service';
import { AuthService } from './core/services/auth/auth.service';
import { User } from './core/models/user.model';
import {WebSocketService} from './core/services/web-socket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    NgIf,
    ChatComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'client';

  showVideo: boolean = false;
  showChatWindow: boolean = false;
  currentChatSessionId: string | null = null;

  private appSubscriptions: Subscription = new Subscription();
  private adminWebSocketSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private chatWindowService: ChatWindowService,
    private webSocketService: WebSocketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.appSubscriptions.add(
      this.router.events.subscribe(() => {
        const currentPath = this.router.url;
        this.showVideo = currentPath === '/login' ||
          currentPath === '/' ||
          currentPath === '/signup' ||
          currentPath.startsWith('/reset-password') ||
          currentPath === '/forgot-password';
      })
    );

    this.appSubscriptions.add(
      this.chatWindowService.showChat$.subscribe((show: boolean) => {
        this.showChatWindow = show;
      })
    );
    this.appSubscriptions.add(
      this.chatWindowService.chatSessionId$.subscribe((sessionId: string | null) => {
        this.currentChatSessionId = sessionId;
      })
    );

    this.appSubscriptions.add(
      this.authService.loggedUser$.subscribe((user: User | null) => {
        if (user && user.userRole === 'ADMINISTRATOR') {
          if (!this.adminWebSocketSubscription || this.adminWebSocketSubscription.closed) {
            console.log('Admin logged in, activating global admin WebSocket listener.');
            this.adminWebSocketSubscription = this.webSocketService.getMessages().subscribe(
              (message: any) => {
                console.log('Global Admin Listener received message (from any tab):', message);
              },
              (error: any) => {
                console.error('Global Admin WebSocket error:', error);
              }
            );
          }
        } else {
          if (this.adminWebSocketSubscription && !this.adminWebSocketSubscription.closed) {
            console.log('Admin logged out or not admin, deactivating global admin WebSocket listener.');
            this.adminWebSocketSubscription.unsubscribe();
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.appSubscriptions.unsubscribe();
    if (this.adminWebSocketSubscription) {
      this.adminWebSocketSubscription.unsubscribe();
    }
  }

  openChat(sessionId: string | null = null): void {
    this.chatWindowService.openChat(sessionId);
  }

  closeChat(): void {
    this.chatWindowService.closeChat();
  }
}
