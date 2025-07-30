import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {CommonModule, CurrencyPipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-ride-summary',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    CurrencyPipe
  ],
  templateUrl: './ride-summary.component.html',
  styleUrl: './ride-summary.component.css',
})
export class RideSummaryComponent implements OnInit {
  @Input() routeData: any;
  @Input() additionalOptions: any;
  @Input() passengers: string[] = [];
  @Input() splitFareEmails: string[] = [];
  @Input() showPopup: boolean = false;
  @Input() fullPrice: number | undefined;

  @Output() popupClosed = new EventEmitter<void>();
  @Output() paymentConfirmed = new EventEmitter<void>();
  @Output() favoriteToggled = new EventEmitter<{ routeData: any, additionalOptions: any, isFavorite: boolean }>();

  showTrackingPopup: boolean = false;
  trackingMessage: string = '';
  isFavorite: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.isFavorite = false;
  }

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

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    this.favoriteToggled.emit({
      routeData: this.routeData,
      additionalOptions: this.additionalOptions,
      isFavorite: this.isFavorite
    });
    console.log(`Route is now ${this.isFavorite ? 'favorited' : 'unfavorited'}.`);
  }
}
