import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Ride } from '../../core/models/ride.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Driver } from '../../core/models/driver.model';
import { User } from '../../core/models/user.model';
import { DriverService } from '../../core/services/drivers/driver.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RideDetailsMapComponent } from '../ride-details-map/ride-details-map.component';
import { RateRideDialogComponent } from '../rate-ride-dialog/rate-ride-dialog.component';

@Component({
  selector: 'app-ride-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RideDetailsMapComponent,
    MatProgressSpinnerModule,
    RateRideDialogComponent
  ],
  templateUrl: './ride-details-dialog.component.html',
  styleUrls: ['./ride-details-dialog.component.css']
})
export class RideDetailsDialogComponent implements OnInit {
  ride: Ride;
  driver: Driver | null = null;
  driverRating: number | null = null;
  isLoadingDriver: boolean = false;
  loggedUser: User | null = null;

  startCoords: [number, number] | null = null;
  destinationCoords: [number, number] | null = null;
  waypointsCoords: [number, number][] = [];
  routePathCoords: [number, number][] = [];

  constructor(
    public dialogRef: MatDialogRef<RideDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ride: Ride },
    private driverService: DriverService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.ride = data.ride;
  }

  ngOnInit(): void {
    this.extractMapData();

    this.authService.getLoggedUser().subscribe(loggedUser => {
      this.loggedUser = loggedUser;

      if (loggedUser && loggedUser.userRole === 'DRIVER' && loggedUser.id === this.ride.driverId) {
        this.driver = {
          ...loggedUser,
          available: (loggedUser as Driver).available,
          vehicle: (loggedUser as Driver).vehicle,
          location: (loggedUser as Driver).location,
          timeOfLogin: (loggedUser as Driver).timeOfLogin,
          hasFutureDrive: (loggedUser as Driver).hasFutureDrive,
          isAvailable: (loggedUser as Driver).isAvailable,
        };
        this.driverRating = (this.driver as any).averageRating || null;
      } else {
        this.fetchDriverDetailsFromBackend(this.ride.driverId);
      }
    });
  }

  extractMapData(): void {
    if (this.ride.startLocation) {
      this.startCoords = [this.ride.startLocation.latitude, this.ride.startLocation.longitude];
    }
    if (this.ride.destinationLocation) {
      this.destinationCoords = [this.ride.destinationLocation.latitude, this.ride.destinationLocation.longitude];
    }
    if (this.ride.stopLocations?.length) {
      this.waypointsCoords = this.ride.stopLocations.map(loc => [loc.latitude, loc.longitude]);
    }

    this.routePathCoords = [];
    if (this.startCoords) this.routePathCoords.push(this.startCoords);
    this.routePathCoords.push(...this.waypointsCoords);
    if (this.destinationCoords) this.routePathCoords.push(this.destinationCoords);
  }

  fetchDriverDetailsFromBackend(driverId: number): void {
    this.isLoadingDriver = true;
    this.driverService.getDriverById(driverId).subscribe({
      next: (driver: Driver) => {
        this.driver = driver;
        this.driverRating = (driver as any).averageRating || null;
        this.isLoadingDriver = false;
      },
      error: (err) => {
        console.error('Greška prilikom dohvatanja vozača:', err);
        this.driver = null;
        this.driverRating = null;
        this.isLoadingDriver = false;
      }
    });
  }

  getRouteDisplay(): string {
    let route = this.ride.startAddress;
    if (this.ride.stops?.length) {
      route += ' -> ' + this.ride.stops.join(' -> ');
    }
    return route + ' -> ' + this.ride.destinationAddress;
  }

  shouldShowRatingButton(): boolean {
    if (!this.loggedUser) return false;

    const isRegisteredUser = this.loggedUser.userRole === 'REGISTERED_USER';
    const rideFinished = this.ride.rideStatus === 'FINISHED';
    const createdAt = new Date(this.ride.createdAt);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    console.log('Logged User:', this.loggedUser);
    console.log('User Role is REGISTERED_USER:', isRegisteredUser);
    console.log('Ride Status is FINISHED:', rideFinished);
    console.log('Ride Created At:', createdAt);
    console.log('Three Days Ago:', threeDaysAgo);
    console.log('Ride within 3 days:', createdAt >= threeDaysAgo);

    return isRegisteredUser && rideFinished && createdAt >= threeDaysAgo;
  }

  openRatingDialog(): void {

    (document.activeElement as HTMLElement)?.blur();

    const dialogRef = this.dialog.open(RateRideDialogComponent, {
      width: '400px',
      autoFocus: false,
      data: {
        rideId: this.ride.id,
        driverId: this.ride.driverId,
        vehicleId: this.driver?.vehicle?.id || null
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Ocena poslata:', result);
        // TODO: pozvati servis za backend
      }
    });
  }

  orderNow(): void {
    this.dialogRef.close('orderNow');
  }

  orderLater(): void {
    this.dialogRef.close('orderLater');
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
