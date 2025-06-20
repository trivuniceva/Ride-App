// src/app/features/admin/block-user-dialog/block-user-dialog.component.ts

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-block-user-dialog',
  standalone: true,
  templateUrl: './block-user-dialog.component.html',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule
  ],
  styleUrls: ['./block-user-dialog.component.css']
})
export class BlockUserDialogComponent {
  isCurrentlyBlocked: boolean;
  blockNoteControl: FormControl;
  userName: string;
  userRole: string;
  isDriver: boolean;

  constructor(
    public dialogRef: MatDialogRef<BlockUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isCurrentlyBlocked = !data.isCurrentlyActive; // Crucial change here!
    this.userName = data.userName;
    this.userRole = data.userRole;
    this.isDriver = data.isDriver;

    this.blockNoteControl = new FormControl(data.blockNote, [Validators.maxLength(500)]);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.blockNoteControl.invalid) {
      this.blockNoteControl.markAsTouched();
      return;
    }
    this.dialogRef.close({
      isCurrentlyActive: !this.isCurrentlyBlocked, // This flips based on the dialog's current context
      blockNote: this.blockNoteControl.value
    });
  }
}
