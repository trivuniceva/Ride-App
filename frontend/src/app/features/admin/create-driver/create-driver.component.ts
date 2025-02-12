import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {RegistrationFormComponent} from '../../auth/components/registration-form/registration-form.component';
import {Router} from '@angular/router';
import {AuthService} from '../../../core/services/auth/auth.service';
import {NgIf} from '@angular/common';
import {VehicleFormComponent} from '../vehicle-form/vehicle-form.component';

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
export class CreateDriverComponent implements AfterViewInit{
  @ViewChild(RegistrationFormComponent) registrationFormComponent!: RegistrationFormComponent;

  currentStep: number = 1;

  constructor(private router: Router, private authService: AuthService) {}

  ngAfterViewInit() {
    console.log(this.registrationFormComponent.signupForm);
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  registerDriver(): void {

  }
}
