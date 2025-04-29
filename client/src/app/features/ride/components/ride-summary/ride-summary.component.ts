import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {PaymentTrackingComponent} from '../payment-tracking/payment-tracking.component';
import {RideService} from '../../../../core/services/ride/ride.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-ride-summary',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    PaymentTrackingComponent
  ],
  templateUrl: './ride-summary.component.html',
  styleUrl: './ride-summary.component.css',
})
export class RideSummaryComponent {
  @Input() routeData: any;
  @Input() additionalOptions: any;
  @Input() passengers: string[] = [];
  @Input() splitFareEmails: string[] = [];
  @Input() showPopup: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();

  showTrackingPopup: boolean = false;
  trackingMessage: string = '';

  constructor(
    private rideService: RideService,
  ) { }

  getPaymentStatus(email: string): string {
    return "Paid";
  }

  confirmPayment() {
    console.log('Payment Confirmed');
    console.log(this.passengers.length)
    console.log(this.passengers)

    this.showPopup = false;

    const rideRequestData = {
      startAddress: this.routeData.startAddress,
      stops: this.routeData.stops,
      destinationAddress: this.routeData.destinationAddress,
      vehicleType: this.routeData.vehicleType,
      carriesBabies: this.additionalOptions.carriesBabies,
      carriesPets: this.additionalOptions.carriesPets,
      passengers: this.passengers,
      splitFareEmails: this.splitFareEmails,
      paymentStatus: this.splitFareEmails.length > 0 ? 'pending' : 'paid', // Postavite odgovarajući status plaćanja
    };

    this.rideService.createRide(rideRequestData).subscribe({
      next: (response) => {
        console.log('Uspešno naručena vožnja:', response);
        this.showTrackingPopup = true;
        this.trackingMessage = 'Hvala na porudžbini! Vaše vozilo uskoro stiže na adresu.';
        // Ovde možete uraditi dodatne akcije nakon uspešne porudžbine, npr. preusmeravanje na drugu stranicu
        // this.router.navigate(['/order-confirmation']);
      },
      error: (error) => {
        console.error('Greška prilikom naručivanja vožnje:', error);
        this.trackingMessage = 'Došlo je do greške prilikom naručivanja vožnje. Molimo pokušajte ponovo.';
        this.showTrackingPopup = true;
        // Ovde možete prikazati korisniku poruku o grešci
      }
    });
  }

  closePopup() {
    console.log('Popup closed');
    this.showPopup = false;
    this.popupClosed.emit();
  }

  onTrackingPopupClosed() {
    this.showTrackingPopup = false;
  }
}
