import {AfterViewInit, Component, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {RegistrationFormComponent} from '../../auth/components/registration-form/registration-form.component';
import {Router} from '@angular/router';
import {AuthService} from '../../../core/services/auth/auth.service';
import {NgIf} from '@angular/common';
import {VehicleFormComponent} from '../vehicle-form/vehicle-form.component';
import {VehicleService} from '../../../core/services/vehicle/vehicle.service';

@Component({
  selector: 'app-create-driver',
  standalone: true,
  imports: [
    RegistrationFormComponent,
    NgIf,
    VehicleFormComponent
  ],
  templateUrl: './create-driver.component.html',
  styleUrl: './create-driver.component.css'
})

export class CreateDriverComponent implements AfterViewInit {
  currentStep: number = 1;

  @ViewChildren(VehicleFormComponent) vehicleFormComponents!: QueryList<VehicleFormComponent>;
  @ViewChildren(RegistrationFormComponent) registrationFormComponents!: QueryList<RegistrationFormComponent>;

  constructor(private vehicleService: VehicleService) {
  }

  ngAfterViewInit(): void {
    this.vehicleFormComponents.changes.subscribe(() => {
      if (this.vehicleFormComponents.length > 0) {
        console.log('VehicleFormComponent initialized:', this.vehicleFormComponents.first.vehicleForm);
      }
    });
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }


  registerDriver(): void {
    const vehicleFormComponent = this.vehicleFormComponents.first;
    const registrationFormComponent = this.registrationFormComponents.first;

    if (!vehicleFormComponent || !registrationFormComponent) {
      console.error('One of the forms is not initialized.');
      return;
    }

    if (registrationFormComponent.signupForm.invalid || vehicleFormComponent.vehicleForm.invalid) {
      alert('Please fill out all required fields correctly.');
      return;
    }

    const driverData = {
      email: registrationFormComponent.signupForm.value.email,
      password: registrationFormComponent.signupForm.value.password,
      firstname: registrationFormComponent.signupForm.value.firstname,
      lastname: registrationFormComponent.signupForm.value.lastname,
      phone: registrationFormComponent.signupForm.value.phone,
      address: registrationFormComponent.signupForm.value.address,
      role: 'DRIVER',
      vehicle: {
        registrationNumber: vehicleFormComponent.vehicleForm.value.registrationNumber,
        vehicleName: vehicleFormComponent.vehicleForm.value.vehicleName,
        vehicleType: vehicleFormComponent.vehicleForm.value.vehicleType
      }
    };

    console.log('Driver Data:', driverData);

    this.vehicleService.registerDriver(driverData).subscribe({
      next: (response) => {
        console.log('Driver registered successfully:', response);
        alert('Driver registered successfully!');
      },
      error: (error) => {
        console.error('Error registering driver:', error);
        alert('Error registering driver. Please try again.');
      }
    });
  }

}
