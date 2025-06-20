import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {NavbarComponent} from './shared/navbar/navbar.component';
import {NgIf} from '@angular/common';
import {ChatComponent} from "./features/chat/chat.component";
import { Subscription } from 'rxjs';
import {ChatWindowService} from './core/services/chat/chat-window.service';

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

  private chatSubscriptions: Subscription = new Subscription();

  constructor(private router: Router, private chatWindowService: ChatWindowService) {}

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      const currentPath = this.router.url;
      this.showVideo = currentPath === '/login' ||
        currentPath === '/' ||
        currentPath === '/signup' ||
        currentPath.startsWith('/reset-password') ||
        currentPath === '/forgot-password';
    });

    this.chatSubscriptions.add(
      this.chatWindowService.showChat$.subscribe((show: boolean) => {
        this.showChatWindow = show;
      })
    );
    this.chatSubscriptions.add(
      this.chatWindowService.chatSessionId$.subscribe((sessionId: string | null) => {
        this.currentChatSessionId = sessionId;
      })
    );
  }

  ngOnDestroy(): void {
    this.chatSubscriptions.unsubscribe();
  }

  openChat(sessionId: string | null = null): void {
    this.chatWindowService.openChat(sessionId);
  }

  closeChat(): void {
    this.chatWindowService.closeChat();
  }
}
