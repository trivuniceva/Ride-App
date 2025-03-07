import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {MatSnackBar} from '@angular/material/snack-bar';
import {LoginFormComponent} from '../../components/login-form/login-form.component';

@Component({
    selector: 'app-login',
    imports: [
        LoginFormComponent
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) { }

  handleLogin(event: { email: string; password: string }) {
    console.log("Attempting to log in...");
    this.authService.login(event.email, event.password).subscribe(
      response => {
        console.log('Login successful', response);
        this.authService.storageHandle({ user: response });
        this.router.navigate(['/profile']);
      },
      error => {
        console.error('Login failed', error);
        if (error.status === 404) {
          this.snackBar.open('Email not registered. Please sign up.', 'Close', { duration: 3000 });
          this.router.navigate(['/signup']);
        } else if (error.status === 401) {
          this.snackBar.open('Incorrect password. Please try again.', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('An error occurred. Please try again.', 'Close', { duration: 3000 });
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
