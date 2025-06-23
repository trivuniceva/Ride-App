import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-ride-tracking-popup',
  standalone: true,
  imports: [NgIf],
  templateUrl: './ride-tracking-popup.component.html',
  styleUrls: ['./ride-tracking-popup.component.css']
})
export class RideTrackingPopupComponent {
  @Input() message: string = '';
  @Input() driverName: string | null = null;
  @Input() driverPictureUrl: string | null = null;
  @Output() closePopup = new EventEmitter<void>();

  onClose() {
    this.closePopup.emit();
  }
}
