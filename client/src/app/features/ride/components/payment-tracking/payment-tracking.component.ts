import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-payment-tracking',
  standalone: true,
  imports: [NgIf, NgForOf],
  templateUrl: './payment-tracking.component.html',
  styleUrl: './payment-tracking.component.css'
})
export class PaymentTrackingComponent {
  @Input() splitFareEmails: string[] = [];
  @Input() message: string = '';
  @Input() showTrackingPopup: boolean = false;
  @Output() trackingClosed = new EventEmitter<void>();

  getPaymentStatus(email: string): string {
    return "Paid"; // Zameni sa pravim statusom iz servisa ako imaš
  }

  closeTrackingPopup() {
    this.showTrackingPopup = false;
    this.trackingClosed.emit();
  }

}
