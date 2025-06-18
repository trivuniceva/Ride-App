import { Component } from '@angular/core';
import {UserService} from "../../core/services/user/user.service";
import {Router} from "@angular/router";
import {AuthService} from "../../core/services/auth/auth.service";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {WebSocketService} from '../../core/services/web-socket.service';
import {RideRequestPopupComponent} from '../drivers/ride-request-popup/ride-request-popup.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    RideRequestPopupComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  user: any;
  isEditing = false;

  showPopup = false;
  popupMessage = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getLoggedUser();
    console.log(this.user);

    if (this.user && this.user.userRole === 'DRIVER') {
      this.webSocketService.connect(this.user.id, (notification: any) => {
        this.popupMessage = notification.message;
        this.showPopup = true;
      });
    }
  }


  enableEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
  }

  saveChanges() {

  }

  onFileSelected($event: Event) {

  }

  deleteAcc() {
  }

  acceptRide() {
    this.showPopup = false;

    this.userService.acceptRideAsDriver().subscribe({
      next: (response: any) => {
        alert('✅ ' + response.message);
      },
      error: (err) => {
        console.error('Greška pri potvrđivanju vožnje:', err);
        if (err.error && err.error.error) {
          alert('❌ Greška pri potvrđivanju vožnje: ' + err.error.error);
        } else {
          alert('❌ Došlo je do nepoznate greške pri potvrđivanju vožnje.');
        }
      }
    });
  }

  rejectRide() {
    this.showPopup = false;
    // TODO: Pozovi BE da odbije vožnju
    alert('❌ Odbio si vožnju.');
  }

}
