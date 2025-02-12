import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import {RegistrationFormComponent} from '../../components/registration-form/registration-form.component';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    RegistrationFormComponent,
  ],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  constructor(private router: Router, private authService: AuthService) {}

  onFormSubmit(userData: any): void {
    this.authService.register(userData).subscribe(
      response => {
        console.log('Registration successful:', response);
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Registration error:', error);
      }
    );
  }
}
