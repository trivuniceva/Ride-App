import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { RegistrationFormComponent } from '../../components/registration-form/registration-form.component';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-registration',
    imports: [
        RegistrationFormComponent,
        NgIf
    ],
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements AfterViewInit{
  @ViewChild(RegistrationFormComponent) registrationFormComponent!: RegistrationFormComponent;

  currentStep: number = 1;

  constructor(private router: Router, private authService: AuthService) {}

  ngAfterViewInit() {
    console.log(this.registrationFormComponent.signupForm);
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  onSubmitForm(): void {
    console.log("<33333");
    if (this.registrationFormComponent && this.registrationFormComponent.signupForm.valid) {
      this.authService.register({
        email: this.registrationFormComponent.signupForm.value.email,
        password: this.registrationFormComponent.signupForm.value.password,
        firstname: this.registrationFormComponent.signupForm.value.firstname,
        lastname: this.registrationFormComponent.signupForm.value.lastname,
        address: this.registrationFormComponent.signupForm.value.address,
        phone: this.registrationFormComponent.signupForm.value.phone,
      }).subscribe(
        response => {
          console.log('Registration successful:', response);
          this.router.navigate(['/login']);
        },
        error => {
          console.error('Registration error:', error);
        }
      );
    } else {
      console.error("Form is invalid.");
    }
  }

}
