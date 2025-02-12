import { Component } from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {UserService} from '../../../../core/services/user/user.service';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private userService: UserService) {}

  onSubmit() {
    console.log(this.email);

    if (!this.email) {
      this.errorMessage = 'Email is required.';
      return;
    }

    // this.userService.requestPasswordReset(this.email).subscribe({
    //   next: (response: any) => {
    //     // Proveri da li je odgovor uspešan i prikazi poruku
    //     console.log(response);
    //     if (response && typeof response === 'string') {
    //       alert(response);
    //     } else {
    //       alert('Password reset email sent if email exists.');
    //     }
    //
    //     this.goToLogin();
    //   },
    //   error: (err: HttpErrorResponse) => {
    //     this.errorMessage = 'An error occurred while sending the password reset email.';
    //     console.error(err);
    //   }
    // });
  }


  goToLogin() {
    this.router.navigate(['/login']);
  }
}
