import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../../core/services/auth/auth.service";

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

    constructor(private authService: AuthService, private router: Router) { }

    login() {
        console.log("Attempting to log in...");
        this.authService.login(this.email, this.password).subscribe(
            response => {
                console.log('Login successful', response);
                // this.authService.storageHandle({ user: response });
                // this.router.navigate(['/profile']);
            },
            error => {
                console.error('Login failed', error);
                if (error.status === 403) {
                    console.error('Access Forbidden: Check credentials or user roles.');
                    console.log('Error details:', error);  // Log the full error response
                }
            }
        );
    }



    forgotPassword() {

    }

    goToSignup() {
        this.router.navigate(['/signup'])
    }


}
