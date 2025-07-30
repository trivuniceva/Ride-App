import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
export class RideRequestPopupComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() message: string = '';
  @Input() popupType: 'request' | 'action' = 'request';
  @Input() rideId: number | null = null;

  @Output() accept = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();

  @Output() rideAction = new EventEmitter<{ action: 'start' | 'cancel' | 'complete', reason?: string }>();

  showCancellationReason: boolean = false;
  cancellationReason: string = '';
  isReasonInvalid: boolean = false;
  isArrivedAtDestination: boolean = false;

  ngOnInit(): void {
    this.resetState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message'] && changes['message'].currentValue) {
      this.checkIfArrivedAtDestination(changes['message'].currentValue);
    }
    if (changes['visible'] && !changes['visible'].currentValue) {
      this.resetState();
    }
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

  onCompleteRide(): void {
    this.rideAction.emit({ action: 'complete' });
    this.resetState();
  }

  private checkIfArrivedAtDestination(message: string): void {
    this.isArrivedAtDestination = message.toLowerCase().includes('odredište');
  }

  private resetState(): void {
    this.showCancellationReason = false;
    this.cancellationReason = '';
    this.isReasonInvalid = false;
    this.isArrivedAtDestination = false;
  }
}
