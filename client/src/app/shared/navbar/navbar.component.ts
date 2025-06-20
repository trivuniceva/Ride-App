import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { ChatWindowService } from '../../core/services/chat/chat-window.service';
import { User } from '../../core/models/user.model';
import { Subscription } from 'rxjs';

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

  private authSubscription: Subscription | undefined;

  constructor(private authService: AuthService, private chatWindowService: ChatWindowService) { }

  ngOnInit(): void {
    this.authSubscription = this.authService.loggedUser$.subscribe((user: User | null) => {
      if (user && user.userRole) {
        this.userRole = user.userRole;
      } else {
        this.userRole = null;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  openChatWindow(): void {
    this.chatWindowService.openChat();
  }
}
