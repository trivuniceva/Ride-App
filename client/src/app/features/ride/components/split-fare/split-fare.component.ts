import {Component, Output, EventEmitter, Input} from '@angular/core';
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
  @Input() fullPrice: number | undefined;

  passengerEmails: string[] = [];
  newPassengerEmail: string = '';

  constructor(private splitFareService: SplitFareService) {}


  addPassenger() {
    if (this.newPassengerEmail) {
      this.passengerEmails.push(this.newPassengerEmail);
      this.newPassengerEmail = '';
      this.emitPassengers();
    }
  }

  removePassenger(email: string) {
    this.passengerEmails = this.passengerEmails.filter(e => e !== email);
    this.emitPassengers();
  }

  emitPassengers() {
    console.log('Cena:', this.fullPrice);
    this.passengersAdded.emit([...this.passengerEmails]);
    // this.splitFareService.sendPassengerEmails(this.passengerEmails, this.fullPrice).subscribe({
    //   next: () => {
    //     alert('Payment request sent successfully!');
    //     this.passengersAdded.emit(this.passengerEmails);
    //   },
    //   error: err => {
    //     console.error('Error sending emails:', err);
    //     alert('Failed to send payment request!');
    //   }
    // });
  }


}
