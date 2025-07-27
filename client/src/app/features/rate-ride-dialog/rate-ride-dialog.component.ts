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
    public data: { rideId: number; driverId: number; vehicleId: number | null },
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.ratingForm = this.fb.group({
      rating: [null, [Validators.required]],
      comment: ['']
    });
  }

  submit(): void {
    if (this.ratingForm.valid) {
      const ratingData = {
        rideId: this.data.rideId,
        driverId: this.data.driverId,
        vehicleId: this.data.vehicleId,
        rating: this.ratingForm.value.rating,
        comment: this.ratingForm.value.comment
      };
      this.snackBar.open('Hvala na oceni!', 'Zatvori', { duration: 3000 });
      this.dialogRef.close(ratingData);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
