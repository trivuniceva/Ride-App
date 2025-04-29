import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-payment-tracking',
  standalone: true,
  imports: [NgIf, NgForOf, NgClass],
  templateUrl: './payment-tracking.component.html',
  styleUrl: './payment-tracking.component.css'
})
export class PaymentTrackingComponent implements OnInit{
  @Input() splitFareEmails: string[] = [];
  @Input() passengers: string[] = [];
  @Input() message: string = '';
  @Input() showTrackingPopup: boolean = false;
  @Output() trackingClosed = new EventEmitter<void>();

  paymentStatuses: { [email: string]: 'Paid' | 'Pending' } = {};

  ngOnInit() {
    this.splitFareEmails.forEach(email => {
      this.paymentStatuses[email] = 'Pending';
    });

    // simulacija promene statusa plaćanja
    setTimeout(() => {
      if (this.splitFareEmails.length > 0) {
        this.paymentStatuses[this.splitFareEmails[0]] = 'Paid';
      }
    }, 3000);

    if (this.splitFareEmails.length > 1) {
      setTimeout(() => {
        this.paymentStatuses[this.splitFareEmails[1]] = 'Paid';
      }, 6000);
    }
  }

  getPaymentStatus(email: string): 'Paid' | 'Pending' {
    return this.paymentStatuses[email] || 'Pending';
  }

  getInitials(email: string): string {
    const parts = email.split('@')[0].split('.');
    let initials = '';
    if (parts.length > 0 && parts[0]) {
      initials += parts[0].charAt(0).toUpperCase();
    }
    if (parts.length > 1 && parts[1]) {
      initials += parts[1].charAt(0).toUpperCase();
    } else if (parts.length === 1 && parts[0].length > 1) {
      initials += parts[0].charAt(1).toUpperCase();
    }
    return initials;
  }

  closeTrackingPopup() {
    this.showTrackingPopup = false;
    this.trackingClosed.emit();
  }

}
