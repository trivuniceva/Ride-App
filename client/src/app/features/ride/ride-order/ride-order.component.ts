import { Component, OnInit } from '@angular/core';
import { MapTestComponent } from '../map-test/map-test.component';
import { RouteFormComponent } from '../route-form/route-form.component';
import axios from 'axios';
import * as L from 'leaflet';
import {DriversAvailabilityComponent} from '../../drivers/drivers-availability/drivers-availability.component';
import * as polyline from '@mapbox/polyline';

@Component({
  selector: 'app-ride-order',
  standalone: true,
  imports: [MapTestComponent, RouteFormComponent, DriversAvailabilityComponent, MapTestComponent],
  templateUrl: './ride-order.component.html',
  styleUrls: ['./ride-order.component.css'],
})
export class RideOrderComponent implements OnInit {
  startCoords: [number, number] | null = null;
  destinationCoords: [number, number] | null = null;
  alternativeRoutes: [number, number][] = [];

  ngOnInit(): void {}

  async handleRouteData(routeData: {
    startAddress: string;
    destinationAddress: string;
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



  async geocodeAddress(address: string): Promise<[number, number] | null> {
    const response = await axios.get(
      `https://api.openrouteservice.org/geocode/search?api_key=5b3ce3597851110001cf624851a1e060196148248c82526abcb25d4f&text=${encodeURIComponent(
        address
      )}`
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
            Authorization: '5b3ce3597851110001cf624851a1e060196148248c82526abcb25d4f',
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Odgovor sa rutiranjem:', response.data);
      return response.data.routes; // Vraćanje routes
    } catch (error) {
      console.error('Greška tokom izračunavanja rute:', error);
      return [];
    }
  }




}
