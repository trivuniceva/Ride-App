import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ride-request-popup',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    FormsModule
  ],
  templateUrl: './ride-request-popup.component.html',
  styleUrl: './ride-request-popup.component.css'
})
export class RideRequestPopupComponent implements OnInit {
  @Input() visible = false;
  @Input() message: string = '';
  @Input() popupType: 'request' | 'action' = 'request';
  @Input() rideId: number | null = null;

  @Output() accept = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();

  @Output() rideAction = new EventEmitter<{ action: 'start' | 'cancel', reason?: string }>();

  showCancellationReason: boolean = false;
  cancellationReason: string = '';
  isReasonInvalid: boolean = false;

  ngOnInit(): void {
    this.resetState();
  }

  onAcceptRequest(): void {
    this.accept.emit();
    this.resetState();
  }

  onRejectRequest(): void {
    this.reject.emit();
    this.resetState();
  }

  onStartRide(): void {
    this.rideAction.emit({ action: 'start' });
    this.resetState();
  }

  onCancelRidePrompt(): void {
    this.showCancellationReason = true;
    this.cancellationReason = '';
    this.isReasonInvalid = false;
  }

  onConfirmCancel(): void {
    if (this.cancellationReason.trim().length < 10) {
      this.isReasonInvalid = true;
      return;
    }
    this.isReasonInvalid = false;
    this.rideAction.emit({ action: 'cancel', reason: this.cancellationReason });
    this.resetState();
  }

  onBackToActions(): void {
    this.showCancellationReason = false;
    this.cancellationReason = '';
    this.isReasonInvalid = false;
  }

  private resetState(): void {
    this.showCancellationReason = false;
    this.cancellationReason = '';
    this.isReasonInvalid = false;
  }
}
