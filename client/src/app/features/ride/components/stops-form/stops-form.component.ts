import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
  @Output() stopAddressSelected = new EventEmitter<{ address: string, index: number }>();
  @Output() stopAddressInputted = new EventEmitter<{ event: any, index: number }>();

  @Input() stops: string[] = [];
  @Input() stopAddressOptions: string[][] = [];

  constructor(private http: HttpClient) {}

  getAddressSuggestions(query: string): Promise<string[]> {
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
          return `${street}, ${city || 'Unknown'}, ${country || 'Unknown'}`;
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
    this.stopAddressOptions.push([]);
    this.stopsChanged.emit(this.stops);
  }

  removeStop(index: number): void {
    this.stops.splice(index, 1);
    this.stopAddressOptions.splice(index, 1);
    this.stopsChanged.emit(this.stops);
  }

  onStopAddressSelect(address: string, index: number): void {
    this.stops[index] = address;
    this.stopAddressSelected.emit({ address, index });
    this.stopsChanged.emit(this.stops);
  }
}
