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
  @Input() fullPrice: number | undefined;

  @Output() popupClosed = new EventEmitter<void>();
  @Output() paymentConfirmed = new EventEmitter<void>();

  showTrackingPopup: boolean = false;
  trackingMessage: string = '';

  constructor(
  ) { }

  getPaymentStatus(email: string): string {
    return "Paid";
  }

  confirmPayment() {
    console.log('Payment Confirmed in RideSummaryComponent');
    this.paymentConfirmed.emit();
    this.closePopup();
  }

  closePopup() {
    console.log('Popup closed in RideSummaryComponent');
    this.showPopup = false;
    this.popupClosed.emit();
  }

  onTrackingPopupClosed() {
    this.showTrackingPopup = false;
  }
}
