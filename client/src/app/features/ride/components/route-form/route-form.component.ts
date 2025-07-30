import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { StopsFormComponent } from '../stops-form/stops-form.component';

import axios from 'axios';
import * as polyline from '@mapbox/polyline';
import { environment } from '../../../../../environments/environment';

export interface AddressLocation {
  address: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-route-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    CommonModule,
    StopsFormComponent,
  ],
  templateUrl: './route-form.component.html',
  styleUrls: ['./route-form.component.css'],
})
export class RouteFormComponent {
  @Output() routeDataSubmitted = new EventEmitter<{
    startAddress: string;
    stops: string[];
    destinationAddress: string;
    startLocation: { latitude: number; longitude: number } | null;
    stopLocations: { latitude: number; longitude: number }[];
    destinationLocation: { latitude: number; longitude: number } | null;
    distance?: number;
    duration?: number;
    price?: number;
    totalLength?: number;
    expectedTime?: number;
    alternativeRoutes?: [number, number][];
  }>();
  @Input() userRole = '';

  private apiKey: string = environment.openrouteserviceApiKey;

  startAddressOptions: AddressLocation[] = [];
  destinationAddressOptions: AddressLocation[] = [];
  stopAddressOptions: AddressLocation[][] = [];

  stops: string[] = [];
  stopLocations: { latitude: number; longitude: number }[] = [];

  startAddressValue: string = '';
  startLocationValue: { latitude: number; longitude: number } | null = null;

  destinationAddressValue: string = '';
  destinationLocationValue: { latitude: number; longitude: number } | null = null;

  startInput: any;
  destinationInput: any;

  currentDistance: number | undefined;
  currentDuration: number | undefined;
  currentPrice: number | undefined;
  currentAlternativeRoutes: [number, number][] = [];


  constructor(private http: HttpClient) {}

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

  async calculatePrice(distance: number, duration: number, selectedClass: string | null): Promise<number> {
    const effectiveVehicleType = selectedClass || 'Standard';

    let price = distance * 120;
    if (effectiveVehicleType === 'Standard') {
      return price + 22;
    } else if (effectiveVehicleType === 'Van') {
      return price + 15;
    } else if (effectiveVehicleType === 'Luxury') {
      return price + 30;
    } else {
      return price;
    }
  }

  getAddressSuggestions(query: string): Promise<AddressLocation[]> {
    let searchQuery = query;
    if (!query.toLowerCase().includes('novi sad')) {
      searchQuery = `Novi Sad ${query}`;
    }
    const API_URL = `https://photon.komoot.io/api/?q=${searchQuery}`;
    return this.http
      .get(API_URL)
      .toPromise()
      .then(
        (data: any) => {
          if (data.features) {
            return data.features.map((item: any) => {
              const street = item.properties.name;
              const city =
                item.properties.city ||
                item.properties.town ||
                item.properties.village;
              const country = item.properties.country;
              const formattedAddress = `${street}, ${city || 'Unknown'}, ${country || 'Unknown'}`;

              const longitude = item.geometry.coordinates[0];
              const latitude = item.geometry.coordinates[1];

              return {
                address: formattedAddress,
                latitude: latitude,
                longitude: longitude,
              } as AddressLocation;
            });
          }
          return [];
        },
        (error) => {
          console.error('Error during search:', error);
          return [];
        }
      );
  }

  onStartAddressInput(event: any): void {
    const input = event.target.value;
    this.startInput = event.target;
    if (input.length > 2) {
      this.getAddressSuggestions(input).then((suggestions) => {
        this.startAddressOptions = suggestions;
      });
    } else {
      this.startAddressOptions = [];
    }
  }

  onDestinationAddressInput(event: any): void {
    const input = event.target.value;
    this.destinationInput = event.target;
    if (input.length > 2) {
      this.getAddressSuggestions(input).then((suggestions) => {
        this.destinationAddressOptions = suggestions;
      });
    } else {
      this.destinationAddressOptions = [];
    }
  }

  onStopsChanged(stops: string[]): void {
    this.stops = stops;
    this.stopLocations = Array(stops.length).fill(null);
  }

  onStartAddressSelect(selected: AddressLocation): void {
    this.startAddressValue = selected.address;
    this.startLocationValue = {
      latitude: selected.latitude,
      longitude: selected.longitude,
    };
    if (this.startInput) {
      this.startInput.value = selected.address;
    }
  }

  onDestinationAddressSelect(selected: AddressLocation): void {
    this.destinationAddressValue = selected.address;
    this.destinationLocationValue = {
      latitude: selected.latitude,
      longitude: selected.longitude,
    };
    if (this.destinationInput) {
      this.destinationInput.value = selected.address;
    }
  }

  onStopAddressSelected(event: { addressLocation: AddressLocation; index: number }): void {
    this.stops[event.index] = event.addressLocation.address;
    this.stopLocations[event.index] = {
      latitude: event.addressLocation.latitude,
      longitude: event.addressLocation.longitude,
    };
  }

  onStopAddressInputted(event: { event: any; index: number }): void {
    this.onStopAddressInput(event.event, event.index);
  }

  onStopAddressInput(event: any, index: number): void {
    const input = event.target.value;
    if (input.length > 2) {
      this.getAddressSuggestions(input).then((suggestions) => {
        if (!this.stopAddressOptions[index]) {
          this.stopAddressOptions[index] = [];
        }
        this.stopAddressOptions[index] = suggestions;
      });
    } else {
      this.stopAddressOptions[index] = [];
    }
  }

  async submitRouteData(event: Event): Promise<void> {
    event.preventDefault();

    const startCoords = await this.geocodeAddress(this.startAddressValue);
    const destinationCoords = await this.geocodeAddress(this.destinationAddressValue);
    const waypointsCoords: [number, number][] = [];

    for (let i = 0; i < this.stops.length; i++) {
      const stopCoord = await this.geocodeAddress(this.stops[i]);
      if (stopCoord) {
        waypointsCoords.push(stopCoord);
      }
    }

    if (!startCoords || !destinationCoords) {
      console.error('Nije moguće geokodirati početnu ili odredišnu adresu.');
      return;
    }

    this.startLocationValue = { latitude: startCoords[0], longitude: startCoords[1] };
    this.destinationLocationValue = { latitude: destinationCoords[0], longitude: destinationCoords[1] };
    this.stopLocations = waypointsCoords.map(coord => ({ latitude: coord[0], longitude: coord[1] }));

    const routes = await this.getRoutes(startCoords, waypointsCoords, destinationCoords);

    if (routes && routes.length > 0 && routes[0].geometry) {
      const decoded = polyline.decode(routes[0].geometry);

      if (decoded && decoded.length > 0) {
        this.currentAlternativeRoutes = decoded.map((coord: [number, number]) => [coord[0], coord[1]]);
        this.currentDistance = Math.round(routes[0].summary.distance / 100) / 10;
        this.currentDuration = Math.round(routes[0].summary.duration / 60);

        this.currentPrice = await this.calculatePrice(this.currentDistance, this.currentDuration, null);

        console.log('Izračunato u RouteFormComponent - Udaljenost:', this.currentDistance, 'km');
        console.log('Izračunato u RouteFormComponent - Trajanje:', this.currentDuration, 'min');
        console.log('Izračunato u RouteFormComponent - Cena:', this.currentPrice, 'RSD');
      } else {
        console.log('Dekodiranje rute nije uspelo u RouteFormComponent.');
      }
    } else {
      console.log('Nema dostupnih ruta ili geometrija rute je prazna u RouteFormComponent.');
      this.currentDistance = undefined;
      this.currentDuration = undefined;
      this.currentPrice = undefined;
      this.currentAlternativeRoutes = [];
    }

    this.routeDataSubmitted.emit({
      startAddress: this.startAddressValue,
      stops: this.stops,
      destinationAddress: this.destinationAddressValue,
      startLocation: this.startLocationValue,
      stopLocations: this.stopLocations.filter(loc => loc !== null),
      destinationLocation: this.destinationLocationValue,
      distance: this.currentDistance,
      duration: this.currentDuration,
      price: this.currentPrice,
      totalLength: this.currentDistance,
      expectedTime: this.currentDuration,
      alternativeRoutes: this.currentAlternativeRoutes,
    });
  }
}
