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
    private webSocketService: WebSocketService
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
}
