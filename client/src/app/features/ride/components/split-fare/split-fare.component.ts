import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {SplitFareService} from '../../../../core/services/split-fare/split-fare.service';

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

  constructor(private splitFareService: SplitFareService) {}


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
    this.splitFareService.sendPassengerEmails(this.passengerEmails).subscribe({
      next: () => {
        alert('Payment request sent successfully!');
        this.passengersAdded.emit(this.passengerEmails);
      },
      error: err => {
        console.error('Error sending emails:', err);
        alert('Failed to send payment request!');
      }
    });
  }

}
