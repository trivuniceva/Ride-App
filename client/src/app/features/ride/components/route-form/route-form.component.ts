import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouteService } from '../../../../core/services/route/route.service';
import { StopsFormComponent } from '../stops-form/stops-form.component';

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
  }>();
  @Input() userRole = '';

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


  constructor(private http: HttpClient, private routeService: RouteService) {}

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

  submitRouteData(event: Event): void {
    event.preventDefault();
    this.routeDataSubmitted.emit({
      startAddress: this.startAddressValue,
      stops: this.stops,
      destinationAddress: this.destinationAddressValue,
      startLocation: this.startLocationValue,
      stopLocations: this.stopLocations.filter(loc => loc !== null),
      destinationLocation: this.destinationLocationValue,
    });
  }
}
