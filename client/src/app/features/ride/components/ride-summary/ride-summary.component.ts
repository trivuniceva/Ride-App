import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {PaymentTrackingComponent} from '../payment-tracking/payment-tracking.component';

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

  getPaymentStatus(email: string): string {
    return "Paid";
  }

  confirmPayment() {
    console.log('Payment Confirmed');
    console.log(this.passengers.length)
    console.log(this.passengers)

    this.showPopup = false;

    if (this.passengers.length > 0) {
      this.showTrackingPopup = true;
      // this.trackingMessage = 'Čekamo potvrdu uplate od ostalih korisnika...';
    } else {
      this.showTrackingPopup = true;
      this.trackingMessage = 'Hvala na porudžbini! Vaše vozilo uskoro stiže na adresu.';
    }
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
