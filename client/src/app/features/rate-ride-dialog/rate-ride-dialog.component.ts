import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import {RideRatingService} from '../../core/services/ride-rating/ride-rating.service';


@Component({
  selector: 'app-rate-ride-dialog',
  standalone: true,
  templateUrl: './rate-ride-dialog.component.html',
  styleUrls: ['./rate-ride-dialog.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSliderModule
  ]
})
export class RateRideDialogComponent {
  ratingForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RateRideDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { rideId: number; driverId: number; vehicleId: number | null; reviewerUserId: number },
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private rideRatingService: RideRatingService
  ) {
    this.ratingForm = this.fb.group({
      driverRating: [null, [Validators.required]],
      vehicleRating: [null, [Validators.required]],
      comment: ['']
    });
  }

  submit(): void {
    if (this.ratingForm.valid) {
      const ratingData = {
        rideId: this.data.rideId,
        driverId: this.data.driverId,
        vehicleId: this.data.vehicleId,
        reviewerUserId: this.data.reviewerUserId,
        driverRating: this.ratingForm.value.driverRating,
        vehicleRating: this.ratingForm.value.vehicleRating,
        comment: this.ratingForm.value.comment
      };

      this.rideRatingService.submitRideRating(ratingData).subscribe({
        next: (response) => {
          this.snackBar.open('Thank you for your rating!', 'Close', { duration: 3000 });
          console.log('Rating submitted successfully:', response);
          this.dialogRef.close(ratingData);
        },
        error: (error) => {
          this.snackBar.open('Failed to submit rating. Please try again.', 'Close', { duration: 3000 });
          console.error('Error submitting rating:', error);
        }
      });
    } else {
      this.ratingForm.markAllAsTouched();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
