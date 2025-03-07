import {Component, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {NavbarComponent} from './shared/navbar/navbar.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    NgIf
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'client';

  showVideo: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      const currentPath = this.router.url;
      this.showVideo = currentPath === '/login' ||
        currentPath === '/' ||
        currentPath === '/signup' ||
        currentPath.startsWith('/reset-password') ||
        currentPath === '/forgot-password';
    });
  }
}
