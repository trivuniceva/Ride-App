import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {AddressLocation} from '../route-form/route-form.component';

@Component({
  selector: 'app-stops-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    CommonModule
  ],
  templateUrl: './stops-form.component.html',
  styleUrls: ['./stops-form.component.css']
})
export class StopsFormComponent {
  @Output() stopsChanged = new EventEmitter<string[]>();
  @Output() stopAddressSelected = new EventEmitter<{ addressLocation: AddressLocation, index: number }>();
  @Output() stopAddressInputted = new EventEmitter<{ event: any, index: number }>();

  @Input() stops: string[] = [];
  @Input() stopAddressOptions: AddressLocation[][] = [];

  constructor(private http: HttpClient) {}

  getAddressSuggestions(query: string): Promise<AddressLocation[]> {
    let searchQuery = query;
    if (!query.toLowerCase().includes('novi sad')) {
      searchQuery = `Novi Sad ${query}`;
    }
    const API_URL = `https://photon.komoot.io/api/?q=${searchQuery}`;
    return this.http.get(API_URL).toPromise().then((data: any) => {
      if (data.features) {
        return data.features.map((item: any) => {
          const street = item.properties.name;
          const city = item.properties.city || item.properties.town || item.properties.village;
          const country = item.properties.country;
          const formattedAddress = `${street}, ${city || 'Unknown'}, ${country || 'Unknown'}`;

          // Photon API vraća koordinate kao [longitude, latitude]
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
    }, (error) => {
      console.error('Error during search:', error);
      return [];
    });
  }

  onStopAddressInput(event: any, index: number): void {
    const input = event.target.value;
    if (input.length > 2) {
      this.getAddressSuggestions(input).then(suggestions => {
        // Osiguraj da je stopAddressOptions[index] inicijalizovan
        if (!this.stopAddressOptions[index]) {
          this.stopAddressOptions[index] = [];
        }
        this.stopAddressOptions[index] = suggestions;
        this.stopAddressInputted.emit({ event, index });
      });
    } else {
      this.stopAddressOptions[index] = [];
      this.stopAddressInputted.emit({ event, index });
    }
  }

  addStop(): void {
    this.stops.push('');
    this.stopAddressOptions.push([]); // Dodaj prazan niz za opcije nove stope
    this.stopsChanged.emit(this.stops);
  }

  removeStop(index: number): void {
    this.stops.splice(index, 1);
    this.stopAddressOptions.splice(index, 1); // Ukloni i opcije za tu stopu
    this.stopsChanged.emit(this.stops);
  }

  onStopAddressSelect(selectedAddressLocation: AddressLocation, index: number): void {
    this.stops[index] = selectedAddressLocation.address; // Za prikaz ostaje string adresa
    this.stopAddressSelected.emit({ addressLocation: selectedAddressLocation, index });
    this.stopsChanged.emit(this.stops); // Ovo emituje listu stringova, što je ok za prikaz
  }
}
