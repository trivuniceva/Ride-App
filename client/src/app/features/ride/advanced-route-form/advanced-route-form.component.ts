import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-advanced-route-form',
    imports: [CommonModule, FormsModule],
    templateUrl: './advanced-route-form.component.html',
    styleUrls: ['./advanced-route-form.component.css']
})
export class AdvancedRouteFormComponent {
  stops: string[] = [];
  passengers: string[] = [];
  selectedOptimization: string = 'fastest';
  selectedVehicle: string = 'standard';
  babyOnBoard: boolean = false;
  petsAllowed: boolean = false;

  @Output() routePreferencesSubmitted = new EventEmitter<any>();




  // Update the method to explicitly cast the event
  addStop(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    const input = keyboardEvent.target as HTMLInputElement;
    const stop = input.value.trim();
    if (stop && !this.stops.includes(stop)) {
      this.stops.push(stop);
    }
  }

  addPassenger(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    const input = keyboardEvent.target as HTMLInputElement;
    const email = input.value.trim();
    if (email && !this.passengers.includes(email)) {
      this.passengers.push(email);
    }
  }


  // Function to remove a stop
  removeStop(stop: string) {
    this.stops = this.stops.filter(s => s !== stop);
  }

  // Function to remove a passenger
  removePassenger(email: string) {
    this.passengers = this.passengers.filter(e => e !== email);
  }

  // Submit the ride preferences
  submitRidePreferences() {
    const preferences = {
      stops: this.stops,
      selectedOptimization: this.selectedOptimization,
      passengers: this.passengers,
      selectedVehicle: this.selectedVehicle,
      babyOnBoard: this.babyOnBoard,
      petsAllowed: this.petsAllowed
    };
    this.routePreferencesSubmitted.emit(preferences);
  }
}
