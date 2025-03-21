import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouteService } from '../../../../core/services/route/route.service';
import { StopsFormComponent } from '../stops-form/stops-form.component';

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
  }>();
  @Input() userRole = '';

  startAddressOptions: string[] = [];
  destinationAddressOptions: string[] = [];
  stopAddressOptions: string[][] = [];
  stops: string[] = [];

  startAddressValue: string = '';
  destinationAddressValue: string = '';
  startInput: any;
  destinationInput: any;

  constructor(private http: HttpClient, private routeService: RouteService) {}

  getAddressSuggestions(query: string): Promise<string[]> {
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
              return `${street}, ${city || 'Unknown'}, ${country || 'Unknown'}`;
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
  }

  onStopAddressSelected(event: { address: string; index: number }): void {
    this.stops[event.index] = event.address;
  }

  onStopAddressInputted(event: { event: any; index: number }): void {
    this.onStopAddressInput(event.event, event.index);
  }

  submitRouteData(event: Event): void {
    event.preventDefault();
    this.routeDataSubmitted.emit({
      startAddress: this.startAddressValue,
      stops: this.stops,
      destinationAddress: this.destinationAddressValue,
    });
  }

  onStartAddressSelect(address: string): void {
    this.startAddressValue = address;
    if (this.startInput) {
      this.startInput.value = address;
    }
  }

  onDestinationAddressSelect(address: string): void {
    this.destinationAddressValue = address;
    if (this.destinationInput) {
      this.destinationInput.value = address;
    }
  }

  onStopAddressInput(event: any, index: number): void {
    const input = event.target.value;
    if (input.length > 2) {
      this.getAddressSuggestions(input).then((suggestions) => {
        this.stopAddressOptions[index] = suggestions;
      });
    } else {
      this.stopAddressOptions[index] = [];
    }
  }
}
