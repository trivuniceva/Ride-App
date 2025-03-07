import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
    selector: 'app-vehicle-form',
    imports: [
        ReactiveFormsModule,
        NgIf,
        NgForOf
    ],
    templateUrl: './vehicle-form.component.html',
    styleUrl: './vehicle-form.component.css'
})
export class VehicleFormComponent implements OnInit{
  @Input() currentStep: number = 1;
  @Output() goToStep: EventEmitter<number> = new EventEmitter();
  vehicleForm!: FormGroup;
  vehicleTypes = ['Standard', 'Luxury', 'Van'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.vehicleForm = this.fb.group({
      registrationNumber: ['', Validators.required],
      vehicleName: ['', Validators.required],
      vehicleType: ['', Validators.required],
    });
  }


}
