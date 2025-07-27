import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Ride } from '../../core/models/ride.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Driver } from '../../core/models/driver.model';
import { DriverService } from '../../core/services/drivers/driver.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {RideDetailsMapComponent} from '../ride-details-map/ride-details-map.component';

@Component({
  selector: 'app-ride-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RideDetailsMapComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './ride-details-dialog.component.html',
  styleUrls: ['./ride-details-dialog.component.css']
})
export class RideDetailsDialogComponent implements OnInit {
  ride: Ride;
  driver: Driver | null = null;
  driverRating: number | null = null;
  isLoadingDriver: boolean = false;

  startCoords: [number, number] | null = null;
  destinationCoords: [number, number] | null = null;
  waypointsCoords: [number, number][] = [];
  routePathCoords: [number, number][] = [];

  constructor(
    public dialogRef: MatDialogRef<RideDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ride: Ride },
    private driverService: DriverService,
    private authService: AuthService
  ) {
    this.ride = data.ride;
  }

  ngOnInit(): void {
    this.extractMapData();

    this.authService.getLoggedUser().subscribe(loggedUser => {
      if (loggedUser && loggedUser.userRole === 'DRIVER' && loggedUser.id === this.ride.driverId) {
        this.driver = {
          id: loggedUser.id,
          email: loggedUser.email,
          firstname: loggedUser.firstname,
          lastname: loggedUser.lastname,
          userRole: loggedUser.userRole,
          address: loggedUser.address,
          phone: loggedUser.phone,
          active: loggedUser.active,
          blockNote: loggedUser.blockNote,
          profilePic: loggedUser.profilePic,
          paypalEmail: loggedUser.paypalEmail,
          bitcoinAddress: loggedUser.bitcoinAddress,
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
    if (this.ride.stopLocations && this.ride.stopLocations.length > 0) {
      this.waypointsCoords = this.ride.stopLocations.map(point => [point.latitude, point.longitude]);
    }

    const routePoints: [number, number][] = [];
    if (this.startCoords) routePoints.push(this.startCoords);
    this.waypointsCoords.forEach(wp => routePoints.push(wp));
    if (this.destinationCoords) routePoints.push(this.destinationCoords);
    this.routePathCoords = routePoints;
  }

  fetchDriverDetailsFromBackend(driverId: number): void {
    if (driverId) {
      this.isLoadingDriver = true;
      this.driverService.getDriverById(driverId).subscribe({
        next: (driver: Driver) => {
          this.driver = driver;
          this.driverRating = (driver as any).averageRating || null;
          this.isLoadingDriver = false;
        },
        error: (err) => {
          console.error('Error fetching driver details:', err);
          this.driver = null;
          this.driverRating = null;
          this.isLoadingDriver = false;
        }
      });
    }
  }

  getRouteDisplay(): string {
    let route = this.ride.startAddress;
    if (this.ride.stops && this.ride.stops.length > 0) {
      route += ' -> ' + this.ride.stops.join(' -> ');
    }
    route += ' -> ' + this.ride.destinationAddress;
    return route;
  }

  orderNow(): void {
    console.log('Order this route now:', this.ride);
    this.dialogRef.close('orderNow');
  }

  orderLater(): void {
    console.log('Save this route for later:', this.ride);
    this.dialogRef.close('orderLater');
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
