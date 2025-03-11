import { Component, EventEmitter, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-route-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    CommonModule
  ],
  templateUrl: './route-form.component.html',
  styleUrls: ['./route-form.component.css']
})
export class RouteFormComponent {
  @Output() routeDataSubmitted = new EventEmitter<{ startAddress: string, destinationAddress: string }>();

  startAddressOptions: string[] = [];
  destinationAddressOptions: string[] = [];
  addressWarning: string = '';
  currentAddress: string = '';

  constructor(private http: HttpClient) {}

  getAddressSuggestions(query: string): void {
    let searchQuery = query;

    if (!query.toLowerCase().includes('novi sad')) {
      searchQuery = `Novi Sad ${query}`;
    }

    const API_URL = `https://photon.komoot.io/api/?q=${searchQuery}`;

    this.http.get(API_URL).subscribe((data: any) => {
      if (data.features) {
        this.startAddressOptions = data.features.map((item: any) => {
          const street = item.properties.name;
          const city = item.properties.city || item.properties.town || item.properties.village;  // Searching for city/town/village
          const country = item.properties.country;

          return `${street}, ${city || 'Unknown'}, ${country || 'Unknown'}`;
        });
      }
    }, (error) => {
      console.error('Error during search:', error);
    });
  }

  onStartAddressInput(event: any): void {
    const input = event.target.value;
    this.currentAddress = input;

    if (input.length > 2) {
      this.getAddressSuggestions(input);
    } else {
      this.startAddressOptions = [];
    }

    if (!this.hasStreetNumber(input)) {
      this.addressWarning = 'Please enter the street number, e.g., Bulevar Evrope 21';
    } else {
      this.addressWarning = '';
    }
  }

  onDestinationAddressInput(event: any): void {
    const input = event.target.value;

    if (input.length > 2) {
      this.getDestinationSuggestions(input);
    } else {
      this.destinationAddressOptions = [];
    }

    if (!this.hasStreetNumber(input)) {
      this.addressWarning = 'Please enter the street number, e.g., Bulevar Evrope 21';
    } else {
      this.addressWarning = '';
    }
  }

  getDestinationSuggestions(query: string): void {
    let searchQuery = query;

    // If the user has not entered Novi Sad, we add "Novi Sad" as a prefix
    if (!query.toLowerCase().includes('novi sad')) {
      searchQuery = `Novi Sad ${query}`;
    }

    const API_URL = `https://photon.komoot.io/api/?q=${searchQuery}`;

    this.http.get(API_URL).subscribe((data: any) => {
      if (data.features) {
        this.destinationAddressOptions = data.features.map((item: any) => {
          const street = item.properties.name;
          const city = item.properties.city || item.properties.town || item.properties.village;  // Searching for city/town/village
          const country = item.properties.country;

          // Format suggestion as "Street, City, Country"
          return `${street}, ${city || 'Unknown'}, ${country || 'Unknown'}`;
        });
      }
    }, (error) => {
      console.error('Error during search:', error);
    });
  }

  hasStreetNumber(address: string): boolean {
    const regex = /\d+/;
    return regex.test(address);
  }

  onAddressSelect(address: string): void {
    this.currentAddress = address;
    this.routeDataSubmitted.emit({ startAddress: address, destinationAddress: address });
  }

  submitRouteData(event: Event): void {
    event.preventDefault();
    this.routeDataSubmitted.emit({ startAddress: this.currentAddress, destinationAddress: this.currentAddress });
  }


}
