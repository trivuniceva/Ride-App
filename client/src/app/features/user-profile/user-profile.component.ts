import { Component, OnInit } from '@angular/core';
import { UserService } from "../../core/services/user/user.service";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth/auth.service";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { WebSocketService } from '../../core/services/web-socket.service';
import { RideRequestPopupComponent } from '../drivers/ride-request-popup/ride-request-popup.component';

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
export class UserProfileComponent implements OnInit {
  user: any;
  isEditing = false;
  showPopup = false;
  popupMessage = '';
  currentRideId: number | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getLoggedUser();

    if (this.user && this.user.userRole === 'DRIVER') {
      this.webSocketService.connect(this.user.id, (notification: any) => {
        this.popupMessage = notification.message;
        this.currentRideId = notification.rideId;
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
    if (!this.currentRideId || !this.user?.id) {
      alert('Greška: Nedostaju podaci za prihvatanje vožnje.');
      return;
    }

    this.showPopup = false;

    this.userService.acceptRide(this.currentRideId, this.user.id).subscribe({
      next: (response: any) => {
        alert('✅ ' + response.message);
        this.currentRideId = null;
      },
      error: (err) => {
        let errorMessage = '❌ Greška pri potvrđivanju vožnje.';
        if (err.error && err.error.error) {
          errorMessage = '❌ ' + err.error.error;
        } else if (err.status === 404) {
          errorMessage += ' (Endpoint nije pronađen ili je pogrešan URL)';
        }
        alert(errorMessage);
        this.currentRideId = null;
      }
    });
  }

  rejectRide() {
    if (!this.currentRideId || !this.user?.id) {
      alert('Greška: Nedostaju podaci za odbijanje vožnje.');
      return;
    }

    this.showPopup = false;

    this.userService.rejectRide(this.currentRideId, this.user.id).subscribe({
      next: (response: any) => {
        alert('❌ ' + response.message);
        this.currentRideId = null;
      },
      error: (err) => {
        let errorMessage = '❌ Greška pri odbijanju vožnje.';
        if (err.error && err.error.error) {
          errorMessage = '❌ ' + err.error.error;
        } else if (err.status === 404) {
          errorMessage += ' (Endpoint nije pronađen ili je pogrešan URL)';
        }
        alert(errorMessage);
        this.currentRideId = null;
      }
    });
  }
}
