import {Component, OnInit} from '@angular/core';
import {RouterModule} from "@angular/router";
import {NgClass, NgIf} from "@angular/common";
import {AuthService} from "../../core/services/auth/auth.service";

@Component({
    selector: 'app-navbar',
  standalone: true,
    imports: [
        RouterModule,
        NgClass,
        NgIf,
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  userRole: string = '';
  isSearchActive: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.userRole$.subscribe((role) => {
      this.userRole = role;
    });
  }

  logout() {

  }

}
