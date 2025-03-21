import { Component, OnInit } from '@angular/core';
import { MapTestComponent } from '../map-test/map-test.component';
import { RouteFormComponent } from '../route-form/route-form.component';
import axios from 'axios';
import * as L from 'leaflet';
import {DriversAvailabilityComponent} from '../../drivers/drivers-availability/drivers-availability.component';
import * as polyline from '@mapbox/polyline';
import {RouteInfoComponent} from '../route-info/route-info.component';
import {AuthService} from '../../../core/services/auth/auth.service';
import {NgIf} from '@angular/common';
import {environment} from '../../../../environments/environment';
import {AdvancedFormPageComponent} from '../advanced-route-form/advanced-form-page/advanced-form-page.component';


@Component({
  selector: 'app-ride-order',
  standalone: true,
  imports: [
    MapTestComponent,
    RouteFormComponent,
    DriversAvailabilityComponent,
    MapTestComponent,
    RouteInfoComponent,
    NgIf,
    AdvancedFormPageComponent
  ],
  templateUrl: './ride-order.component.html',
  styleUrls: ['./ride-order.component.css'],
})
export class RideOrderComponent implements OnInit {
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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.userRole$.subscribe((role) => {
      this.userRole = role;
    });

    this.apiKey = environment.openrouteserviceApiKey;
  }

  async handleRouteData(routeData: {
    startAddress: string;
    destinationAddress: string;
    selectedClass: string | null;
  }): Promise<void> {
    try {
      const startCoords = await this.geocodeAddress(routeData.startAddress);
      const destinationCoords = await this.geocodeAddress(routeData.destinationAddress);

      console.log('nnnnn');
      console.log(startCoords);
      console.log(destinationCoords);
      console.log(routeData);

      if (startCoords && destinationCoords) {
        this.startCoords = startCoords;
        this.destinationCoords = destinationCoords;
        this.startAddress = routeData.startAddress;
        this.destinationAddress = routeData.destinationAddress;
        const routes = await this.getRoutes(startCoords, destinationCoords);

        console.log('routes:', routes); // logovanje routes

        if (routes && routes.length > 0 && routes[0].geometry) {
          console.log('routes[0].geometry:', routes[0].geometry); // logovanje routes[0].geometry

          const decoded = polyline.decode(routes[0].geometry);

          if (decoded && decoded.length > 0) {
            console.log('Uslov ispunjen');
            this.alternativeRoutes = decoded.map(
              (coord: [number, number]) => [coord[0], coord[1]] // obrnuto [lat, lng]
            );

            this.distance = Math.round(routes[0].summary.distance / 100) / 10;
            this.duration = Math.round(routes[0].summary.duration / 60);
            this.price = await this.calculatePrice(this.distance, this.duration, routeData.selectedClass);

            console.log('Udaljenost:', this.distance, 'km');
            console.log('Trajanje:', this.duration, 'min');

            console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ');
            console.log('alternativeRoutes:', this.alternativeRoutes);
          } else {
            console.log('Dekodiranje nije uspelo');
          }
        } else {
          console.log('Uslov nije ispunjen');
        }
      } else {
        console.error('Geocoding failed');
      }
    } catch (error) {
      console.error('Error during route calculation:', error);
    }
  }

  async calculatePrice(distance: number, duration: number, selectedClass: string | null): Promise<number> {
    // const response = await axios.post('/api/calculate-price', {
    //   distance: distance,
    //   duration: duration,
    // });
    // return response.data.price;

    if (selectedClass === 'Standard') {
      return 22;
    } else if (selectedClass === 'Van') {
      return 15;
    } else if (selectedClass === 'Luxury') {
      return 30;
    } else {
      return 0;
    }
  }

  async geocodeAddress(address: string): Promise<[number, number] | null> {
    const response = await axios.get(
      `https://api.openrouteservice.org/geocode/search`,
      {
        params: {
          api_key: this.apiKey,
          text: address
        },
        headers: {
          'Accept': 'application/json',
        },
        timeout: 5000
      }
    );

    if (response.data.features && response.data.features.length > 0) {
      const coords = response.data.features[0].geometry.coordinates;
      return [coords[1], coords[0]]; // [latitude, longitude]
    }
    return null;
  }

  async getRoutes(
    startCoords: [number, number],
    destinationCoords: [number, number]
  ): Promise<any[]> {
    try {
      console.log('Zahtev za rutiranje:', {
        coordinates: [
          [startCoords[1], startCoords[0]],
          [destinationCoords[1], destinationCoords[0]],
        ],
      });
      const response = await axios.post(
        'https://api.openrouteservice.org/v2/directions/driving-car',
        {
          coordinates: [
            [startCoords[1], startCoords[0]],
            [destinationCoords[1], destinationCoords[0]],
          ],
        },
        {
          headers: {
            Authorization: this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Odgovor sa rutiranjem:', response.data);
      return response.data.routes; // Vraćanje routes
    } catch (error: any) {
      console.error('Greška tokom izračunavanja rute:', error);
      console.error('Detalji greške:', error.message, error.code, error.response);

      return [];
    }
  }


  handleAdvancedRoutePreferences($event: any) {

  }
}
