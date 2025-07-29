import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from "../../core/services/user/user.service";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth/auth.service";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { RideRequestPopupComponent } from '../drivers/ride-request-popup/ride-request-popup.component';
import { User } from '../../core/models/user.model';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../core/services/web-socket.service';
import { RideService } from '../../core/services/ride/ride.service';

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
  popupType: 'request' | 'action' = 'request';

  showPasswordChange = false;
  oldPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  showPaymentInfo = false;
  paypalEmail = '';
  bitcoinAddress = '';

  selectedFile: File | null = null;
  profilePicPreview: string | ArrayBuffer | null = null;

  private authSubscription: Subscription | undefined;
  private wsSubscription: Subscription | undefined;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private rideService: RideService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.loggedUser$.subscribe((user: User | null) => {
      this.user = user;
      if (this.user) {
        this.paypalEmail = this.user.paypalEmail || '';
        this.bitcoinAddress = this.user.bitcoinAddress || '';

        if (this.user.profilePic) {
          this.profilePicPreview = `http://localhost:8080${this.user.profilePic}`;
        }
      }

      if (this.user && this.user.userRole === 'DRIVER' && this.user.id) {
        console.log("Inicijalizacija WebSocket pretplate za vozača...");

        this.wsSubscription = this.webSocketService.subscribeToUserTopic(this.user.id, '/user/{userId}/queue/driver-updates').subscribe({
          next: (notification: any) => {
            console.log('--- WebSocket Driver-Specific Notification Received ---');
            console.log('Raw notification object:', notification);
            console.log('Notification Type:', notification.type);
            console.log('Notification Driver ID:', notification.driverId);
            console.log('Current User ID (from component):', this.user?.id);
            console.log('Are IDs matching?', notification.driverId === this.user?.id);

            if (notification.driverId === this.user?.id) {
              switch (notification.type) {
                case 'RIDE_REQUEST':
                  console.log('Conditions met! Showing RIDE_REQUEST popup from driver-specific topic...');
                  this.popupMessage = notification.message;
                  this.currentRideId = notification.rideId;
                  this.popupType = 'request';
                  this.showPopup = true;
                  break;
                case 'DRIVER_ARRIVED_AT_PICKUP_FOR_DRIVER':
                  console.log('Conditions met! Showing DRIVER_ARRIVED_AT_PICKUP_FOR_DRIVER popup...');
                  this.popupMessage = notification.message || 'Stigli ste na početnu adresu vožnje. Da li želite da započnete vožnju ili je otkažete?';
                  this.currentRideId = notification.rideId;
                  this.popupType = 'action';
                  this.showPopup = true;
                  break;
                default:
                  console.log('Nepoznata ili neobrađena vozačeva notifikacija na driver-specific topicu:', notification.type, notification);
                  break;
              }
            } else {
              console.log('Notification ignored on driver-specific topic: Driver ID mismatch. Notification ID:', notification.driverId, 'User ID:', this.user?.id);
            }
          },
          error: (err) => {
            console.error('Greška pri primanju vozačevih notifikacija na driver-specific topicu:', err);
          },
          complete: () => {
            console.log('Vozačeva WebSocket pretplata na driver-specific topic završena.');
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
    if (this.user) {
      this.authService.getLoggedUser().subscribe(user => {
        this.user = user;
        if (this.user && this.user.profilePic) {
          this.profilePicPreview = `http://localhost:8080${this.user.profilePic}`;
        } else {
          this.profilePicPreview = null;
        }
      });
    }
  }

  saveChanges() {
    if (!this.user) return;

    this.userService.updateUserProfile(this.user.id, {
      firstname: this.user.firstname,
      lastname: this.user.lastname,
      address: this.user.address,
      phone: this.user.phone
    }).subscribe({
      next: (response: any) => {
        if (response.message && response.message.includes('Zahtev za ažuriranje profila vozača poslat')) {
          alert(response.message);
          this.isEditing = false;
        } else {
          console.log('Profile updated successfully:', response);
          this.user = response;
          this.authService.storageHandle({ user: response });
          alert('Profil je uspešno ažuriran!');
          this.isEditing = false;
        }

        if (this.selectedFile) {
          this.userService.uploadProfilePicture(this.user!.id, this.selectedFile).subscribe({
            next: (uploadResponse: any) => {
              alert(uploadResponse.message);
              this.user!.profilePic = uploadResponse.profilePicPath;
              this.profilePicPreview = `http://localhost:8080${uploadResponse.profilePicPath}`;
              this.authService.storageHandle({ user: this.user! });
              this.selectedFile = null;
            },
            error: (err) => {
              console.error('Error uploading profile picture:', err);
              alert('Greška pri uploadu slike: ' + (err.error?.error || 'Nepoznata greška.'));
            }
          });
        }
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        alert('Greška pri ažuriranju profila: ' + (err.error?.error || 'Nepoznata greška.'));
      }
    });
  }


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicPreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.profilePicPreview = this.user?.profilePic ? `http://localhost:8080${this.user.profilePic}` : null;
    }
  }

  deleteAcc() {
  }

  togglePasswordChange() {
    this.showPasswordChange = !this.showPasswordChange;
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  changePassword() {
    if (!this.user) return;

    if (this.newPassword !== this.confirmNewPassword) {
      alert('Nove lozinke se ne podudaraju!');
      return;
    }

    this.userService.changePassword(this.user.id, this.oldPassword, this.newPassword).subscribe({
      next: (response) => {
        alert(response.message);
        this.togglePasswordChange();
      },
      error: (err) => {
        alert('Greška pri promeni lozinke: ' + (err.error?.error || 'Nepoznata greška.'));
      }
    });
  }

  togglePaymentInfo() {
    this.showPaymentInfo = !this.showPaymentInfo;
  }

  savePaymentInfo() {
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

  handleRideAction(event: { action: 'start' | 'cancel', reason?: string }): void {
    console.log('Driver ride action received:', event);
    this.showPopup = false;

    if (!this.currentRideId || !this.user?.id) {
      alert('Greška: Nedostaju podaci za akciju vožnje.');
      return;
    }

    if (event.action === 'start') {
      console.log('Driver starting ride for ID:', this.currentRideId);
      this.rideService.startRideByDriver(this.currentRideId).subscribe({
        next: (response) => {
          alert('✅ ' + response.message);
          console.log('Ride started by driver successfully:', response);
          this.currentRideId = null;
        },
        error: (err) => {
          alert('❌ Greška pri započinjanju vožnje: ' + (err.error?.error || 'Nepoznata greška.'));
          console.error('Error starting ride by driver:', err);
        }
      });
    } else if (event.action === 'cancel' && event.reason) {
      console.log('Driver cancelling ride for ID:', this.currentRideId, 'Reason:', event.reason);
      this.rideService.cancelRideByDriver(this.currentRideId, event.reason).subscribe({
        next: (response) => {
          alert('❌ ' + response.message);
          console.log('Ride cancelled by driver successfully:', response);
          this.currentRideId = null;
        },
        error: (err) => {
          alert('❌ Greška pri otkazivanju vožnje: ' + (err.error?.error || 'Nepoznata greška.'));
          console.error('Error cancelling ride by driver:', err);
        }
      });
    }
  }
}
