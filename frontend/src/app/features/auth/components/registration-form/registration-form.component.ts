import { Component, EventEmitter, Output } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css']
})
export class RegistrationFormComponent {
  signupForm!: FormGroup;
  currentStep: number = 1;

  @Output() submitForm: EventEmitter<any> = new EventEmitter();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      address: [''],
      phone: [''],
    });
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  onSubmit(): void {
    if (this.signupForm.invalid || this.signupForm.value.password !== this.signupForm.value.confirmPassword) {
      console.error('Form is invalid or passwords do not match');
      return;
    }

    const userData = {
      email: this.signupForm.value.email,
      password: this.signupForm.value.password,
      firstname: this.signupForm.value.firstname,
      lastname: this.signupForm.value.lastname,
      address: this.signupForm.value.address,
      phone: this.signupForm.value.phone,
    };

    this.submitForm.emit(userData);
  }
}
