import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { ChatWindowService } from '../../core/services/chat/chat-window.service';
import { User } from '../../core/models/user.model';
import { Subscription, filter } from 'rxjs';
import {WebSocketService} from '../../core/services/web-socket.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  userRole: string | null = null;
  isSearchActive: boolean = false;
  unreadAdminMessageCount: number = 0;

  private authSubscription: Subscription | undefined;
  private unreadCountSubscription: Subscription | undefined;
  private routerEventsSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private chatWindowService: ChatWindowService,
    private webSocketService: WebSocketService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authSubscription = this.authService.loggedUser$.subscribe((user: User | null) => {
      if (user && user.userRole) {
        this.userRole = user.userRole;
        if (this.userRole === 'ADMINISTRATOR') {
          this.unreadCountSubscription = this.webSocketService.unreadAdminMessagesCount$.subscribe(
            count => {
              this.unreadAdminMessageCount = count;
            }
          );
          this.routerEventsSubscription = this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
          ).subscribe((event: NavigationEnd) => {
            if (event.urlAfterRedirects === '/admin-chat') {
              this.webSocketService.resetAdminUnreadMessagesCount();
            }
          });
        } else {
          if (this.unreadCountSubscription) {
            this.unreadCountSubscription.unsubscribe();
            this.unreadCountSubscription = undefined;
          }
          if (this.routerEventsSubscription) {
            this.routerEventsSubscription.unsubscribe();
            this.routerEventsSubscription = undefined;
          }
          this.unreadAdminMessageCount = 0;
        }
      } else {
        this.userRole = null;
        if (this.unreadCountSubscription) {
          this.unreadCountSubscription.unsubscribe();
          this.unreadCountSubscription = undefined;
        }
        if (this.routerEventsSubscription) {
          this.routerEventsSubscription.unsubscribe();
          this.routerEventsSubscription = undefined;
        }
        this.unreadAdminMessageCount = 0;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }
    if (this.routerEventsSubscription) {
      this.routerEventsSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  openChatWindow(): void {
    this.chatWindowService.openChat();
  }
}
