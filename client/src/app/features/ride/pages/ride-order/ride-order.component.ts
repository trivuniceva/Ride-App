import { Component, OnInit, SimpleChanges, NgZone, OnDestroy } from '@angular/core';
import { MapTestComponent } from '../../components/map-test/map-test.component';
import { RouteFormComponent } from '../../components/route-form/route-form.component';
import axios from 'axios';
import * as L from 'leaflet';
import { DriversAvailabilityComponent } from '../../../drivers/drivers-availability/drivers-availability.component';
import *as polyline from '@mapbox/polyline';
import { RouteInfoComponent } from '../../route-info/route-info.component';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NgIf } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { AdvancedFormPageComponent } from '../advanced-form-page/advanced-form-page.component';
import { DriverService } from '../../../../core/services/drivers/driver.service';
import { Driver } from '../../../../core/models/driver.model';
import {User} from '../../../../core/models/user.model';
import {Subscription} from 'rxjs';
import {PointDTO} from "../../../../core/models/PointDTO.model";


@Component({
  selector: 'app-ride-order',
  standalone: true,
  imports: [
    MapTestComponent,
    RouteFormComponent,
    RouteInfoComponent,
    NgIf,
    AdvancedFormPageComponent,
  ],
  templateUrl: './ride-order.component.html',
  styleUrls: ['./ride-order.component.css'],
})
export class RideOrderComponent implements OnInit, OnDestroy {
  apiKey: string = '';

  startCoords: [number, number] | null = null;
  destinationCoords: [number, number] | null = null;
  alternativeRoutes: [number, number][] = [];

  distance: number | undefined;
  duration: number | undefined;
  price: number | undefined;
  startAddress: string | undefined;
  destinationAddress: string | undefined;
  userRole: string = '';
  waypointsCoords: [number, number][] = [];
  vehicleType: string | null = null;
  allDrivers: Driver[] = [];
  totalLength: number | undefined;
  expectedTime: number | undefined;
  stops: string[] = [];

  activeDriverLocation: [number, number] | null = null;
  activeDriverId: number | null = null;
  activeRideId: number | null = null;

  private authSubscription: Subscription | undefined;
  private driverSubscription: Subscription | undefined;
  showPopup: boolean = false;

  constructor(private authService: AuthService, private driverService: DriverService, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.loggedUser$.subscribe((user: User | null) => {
      if (user && user.userRole) {
        this.userRole = user.userRole;
        console.log('DEBUG: RideOrderComponent userRole changed to:', this.userRole);
      } else {
        this.userRole = '';
        console.log('DEBUG: RideOrderComponent userRole reset to empty.');
      }
    });

    this.apiKey = environment.openrouteserviceApiKey;

    this.driverSubscription = this.driverService.getDrivers().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.allDrivers = data;
          console.log('Dohvaćeni vozači:', this.allDrivers);
        });
      },
      error: (err) => {
        console.error('Greška pri dohvaćanju vozača:', err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.driverSubscription) {
      this.driverSubscription.unsubscribe();
    }
  }

  async handleRouteData(routeData: {
    startAddress: string;
    stops: string[];
    destinationAddress: string;
    vehicleType?: string | null;
  }): Promise<void> {
    try {
      const startCoords = await this.geocodeAddress(routeData.startAddress);
      const destinationCoords = await this.geocodeAddress(routeData.destinationAddress);
      let waypointsCoords: [number, number][] = [];

      if (routeData.stops && routeData.stops.length > 0) {
        for (let stop of routeData.stops) {
          const stopCoords = await this.geocodeAddress(stop);
          if (stopCoords) {
            waypointsCoords.push(stopCoords);
          }
        }
      }

      if (startCoords && destinationCoords) {
        this.startCoords = startCoords;
        this.destinationCoords = destinationCoords;
        this.startAddress = routeData.startAddress;
        this.destinationAddress = routeData.destinationAddress;
        this.waypointsCoords = waypointsCoords;
        this.vehicleType = routeData.vehicleType || null;
        this.stops = routeData.stops;

        const routes = await this.getRoutes(startCoords, waypointsCoords, destinationCoords);

        console.log('routes:', routes);

        if (routes && routes.length > 0 && routes[0].geometry) {
          const decoded = polyline.decode(routes[0].geometry);

          if (decoded && decoded.length > 0) {
            this.alternativeRoutes = decoded.map((coord: [number, number]) => [coord[0], coord[1]]);

            this.distance = Math.round(routes[0].summary.distance / 100) / 10;
            this.duration = Math.round(routes[0].summary.duration / 60);
            this.price = await this.calculatePrice(this.distance, this.duration, this.vehicleType);

            this.totalLength = this.distance;
            this.expectedTime = this.duration;

            console.log('Udaljenost:', this.distance, 'km');
            console.log('Trajanje:', this.duration, 'min');
            console.log('alternativeRoutes:', this.alternativeRoutes);
          } else {
            console.log('Dekodiranje rute nije uspelo.');
          }
        } else {
          console.log('Nema dostupnih ruta ili geometrija rute je prazna.');
        }
      } else {
        console.error('Geocoding failed: Start or destination coordinates could not be obtained.');
      }
    } catch (error) {
      console.error('Error during route calculation:', error);
    }
  }

  async calculatePrice(distance: number, duration: number, selectedClass: string | null): Promise<number> {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", distance)
    let price = distance*120;
    if (selectedClass === 'Standard') {
      return price + 22;
    } else if (selectedClass === 'Van') {
      return price + 15;
    } else if (selectedClass === 'Luxury') {
      return price + 30;
    } else {
      return 0;
    }
  }

  async geocodeAddress(address: string): Promise<[number, number] | null> {
    try {
      console.log(`Attempting to geocode address: "${address}"`);
      const response = await axios.get(`https://api.openrouteservice.org/geocode/search`, {
        params: {
          api_key: this.apiKey,
          text: address,
        },
        headers: {
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      console.log(`Geocoding response for "${address}":`, response.data);

      if (response.data.features && response.data.features.length > 0) {
        const coords = response.data.features[0].geometry.coordinates;
        console.log(`Geocoding successful for "${address}": [${coords[1]}, ${coords[0]}]`);
        return [coords[1], coords[0]];
      } else {
        console.warn(`No features found for address: "${address}". Response:`, response.data);
        return null;
      }
    } catch (error: any) {
      console.error(`Error geocoding address "${address}":`, error.response ? error.response.data : error.message);
      return null;
    }
  }

  async getRoutes(
    startCoords: [number, number],
    waypointsCoords: [number, number][],
    destinationCoords: [number, number]
  ): Promise<any[]> {
    try {
      let coordinates = [[startCoords[1], startCoords[0]]];
      for (let waypoint of waypointsCoords) {
        coordinates.push([waypoint[1], waypoint[0]]);
      }
      coordinates.push([destinationCoords[1], destinationCoords[0]]);

      console.log('Attempting to get routes with coordinates:', coordinates);

      const response = await axios.post(
        'https://api.openrouteservice.org/v2/directions/driving-car',
        {
          coordinates: coordinates,
        },
        {
          headers: {
            Authorization: this.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('Routes response:', response.data);
      return response.data.routes;
    } catch (error: any) {
      console.error('Greška tokom izračunavanja rute (getRoutes):', error.response ? error.response.data : error.message);
      return [];
    }
  }

  handleRouteDataFromAdvancedForm(routeData: {
    startAddress: string;
    stops: string[];
    destinationAddress: string;
    vehicleType: string | null;
  }): void {
    this.handleRouteData(routeData);
    console.log(
      '.........................................................................................................'
    );
  }

  handleActiveDriverLocationChange(location: [number, number] | null): void {
    this.ngZone.run(() => {
      if (location) {
        this.activeDriverLocation = [...location];
      } else {
        this.activeDriverLocation = null;
      }
      console.log('DEBUG: RideOrderComponent received activeDriverLocation (after update):', this.activeDriverLocation);
    });
  }

  handleActiveDriverIdChange(driverId: number | null): void {
    this.ngZone.run(() => {
      this.activeDriverId = driverId;
      console.log('DEBUG: RideOrderComponent received activeDriverId:', this.activeDriverId);
    });
  }

  handleRideCreated(rideId: number | null): void {
    this.ngZone.run(() => {
      this.activeRideId = rideId;
      console.log('DEBUG: RideOrderComponent activeRideId set to:', this.activeRideId);
    });
  }
}

