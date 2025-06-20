import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from "../../core/services/user/user.service";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth/auth.service";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { RideRequestPopupComponent } from '../drivers/ride-request-popup/ride-request-popup.component';
import { User } from '../../core/models/user.model';
import { Subscription } from 'rxjs';
import {WebSocketService} from '../../core/services/web-socket.service';

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
export class UserProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isEditing = false;
  showPopup = false;
  popupMessage = '';
  currentRideId: number | null = null;

  private authSubscription: Subscription | undefined;
  private wsSubscription: Subscription | undefined;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.loggedUser$.subscribe((user: User | null) => {
      this.user = user;
      if (this.user && this.user.userRole === 'DRIVER') {
        this.wsSubscription = this.webSocketService.getMessages().subscribe((notification: any) => {
          if (notification.type === 'RIDE_REQUEST' && notification.driverId === this.user?.id) {
            this.popupMessage = notification.message;
            this.currentRideId = notification.rideId;
            this.showPopup = true;
          }
        });
      } else {
        if (this.wsSubscription) {
          this.wsSubscription.unsubscribe();
          this.wsSubscription = undefined;
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
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
