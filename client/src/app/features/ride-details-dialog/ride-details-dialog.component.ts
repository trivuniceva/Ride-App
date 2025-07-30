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
import { Router } from '@angular/router';
import {RideReorderService} from '../../core/services/ride-reorder/ride-reorder-service.service';

@Component({
  selector: 'app-ride-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RideDetailsMapComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './ride-details-dialog.component.html',
  styleUrls: ['./ride-details-dialog.component.css']
})
export class RideDetailsDialogComponent implements OnInit {
  ride: Ride;
  driver: Driver | null = null;
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
    private dialog: MatDialog,
    private rideReorderService: RideReorderService,
    private router: Router
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
          averageRating: (loggedUser as Driver).averageRating
        };
      } else {
        if (this.ride.driverId) {
          this.fetchDriverDetailsFromBackend(this.ride.driverId);
        } else {
          this.driver = null;
          this.isLoadingDriver = false;
        }
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
        this.isLoadingDriver = false;
      },
      error: (err) => {
        console.error('Error fetching driver:', err);
        this.driver = null;
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

    return isRegisteredUser && rideFinished && createdAt >= threeDaysAgo;
  }

  openRatingDialog(): void {
    if (!this.loggedUser || this.loggedUser.id === undefined) {
      console.error('Logged user or user ID is not available. Cannot open rating dialog.');
      return;
    }

    (document.activeElement as HTMLElement)?.blur();

    const dialogRef = this.dialog.open(RateRideDialogComponent, {
      width: '400px',
      autoFocus: false,
      data: {
        rideId: this.ride.id,
        driverId: this.ride.driverId,
        vehicleId: this.driver?.vehicle?.id || null,
        reviewerUserId: this.loggedUser.id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Rating submitted:', result);
      }
    });
  }

  orderNow(): void {
    this.rideReorderService.setRideToReorder(this.ride);
    this.dialogRef.close();
    this.router.navigate(['/order-ride']);
  }

  orderLater(): void {
    this.dialogRef.close('orderLater');
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
