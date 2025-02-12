import {Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet} from '@angular/router';
import {HomeComponent} from "./pages/home/home.component";
import {NavbarComponent} from "./core/components/navbar/navbar.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
      RouterOutlet,
      HomeComponent,
      NavbarComponent,
      NgIf,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'frontend';
  showVideo: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      const currentPath = this.router.url;
      this.showVideo = currentPath === '/login' || currentPath === '/' || currentPath === '/signup' || currentPath === '/forgot-password';
    });
  }
}
