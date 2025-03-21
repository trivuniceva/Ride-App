import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-split-fare',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './split-fare.component.html',
  styleUrl: './split-fare.component.css'
})
export class SplitFareComponent {
  @Output() passengersAdded = new EventEmitter<string[]>();

  passengerEmails: string[] = [];
  newPassengerEmail: string = '';

  addPassenger() {
    if (this.newPassengerEmail) {
      this.passengerEmails.push(this.newPassengerEmail);
      this.newPassengerEmail = '';
    }
  }

  removePassenger(email: string) {
    this.passengerEmails = this.passengerEmails.filter(e => e !== email);
  }

  emitPassengers() {
    this.passengersAdded.emit(this.passengerEmails);
  }
}
