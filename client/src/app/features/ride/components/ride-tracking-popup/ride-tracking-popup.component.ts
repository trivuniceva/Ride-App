import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-ride-tracking-popup',
  standalone: true,
  imports: [NgIf],
  templateUrl: './ride-tracking-popup.component.html',
  styleUrls: ['./ride-tracking-popup.component.css']
})
export class RideTrackingPopupComponent implements OnInit, OnDestroy {
  @Input() message: string = '';
  @Input() driverName: string | null = null;
  @Input() driverPictureUrl: string | null = null;
  @Input() autoDismiss: boolean = false;
  @Input() dismissDelay: number = 3000;
  @Output() closePopup = new EventEmitter<void>();

  private timer: any;

  ngOnInit(): void {
    if (this.autoDismiss) {
      this.timer = setTimeout(() => {
        this.onClose();
      }, this.dismissDelay);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  onClose() {
    this.closePopup.emit();
  }
}
