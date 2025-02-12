import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../../core/services/auth/auth.service";
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
      FormsModule

  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
    email: string = '';
    password: string = '';
    errorMessage: string = '';

    constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) { }

  login() {
    console.log("Attempting to log in...");
    this.authService.login(this.email, this.password).subscribe(
      response => {
        console.log('Login successful', response);
        this.authService.storageHandle({ user: response });
        this.router.navigate(['/profile']);
      },
      error => {
        console.error('Login failed', error);
        if (error.status === 404) {
          console.error('Email not registered.');
          this.snackBar.open('Email not registered. Please sign up.', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
          this.router.navigate(['/signup']);
        } else if (error.status === 401) {
          console.error('Incorrect password.');
          this.snackBar.open('Incorrect password. Please try again.', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
        } else {
          console.error('Unexpected error:', error);
          this.snackBar.open('An error occurred. Please try again.', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
        }
      }
    );
  }


  forgotPassword() {
    this.router.navigate(['/forgot-password'])
  }

  goToSignup() {
      this.router.navigate(['/signup'])
  }


}
