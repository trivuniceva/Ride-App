import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-ride-summary',
  standalone: true,
  imports: [
    NgIf,
    NgForOf
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

  getPaymentStatus(email: string): string {
    return "Paid";
  }

  confirmPayment() {
    console.log('Payment Confirmed');
  }

  closePopup() {
    console.log('Popup closed');
    this.showPopup = false;
    this.popupClosed.emit();
  }
}
