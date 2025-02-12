import {Component, OnInit} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../../core/services/user/user.service';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,

  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit{

  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  token: string | null = '';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    // this.token = this.route.snapshot.queryParamMap.get('token');
    // console.log('Token from URL:', this.token);
  }

  onSubmit() {
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Both password fields are required.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.token) {
      this.userService.resetPassword(this.token, this.newPassword).subscribe({
        next: (response) => {
          alert(response.message);
          this.router.navigate(['/login']);
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Error occurred while resetting the password.';
          console.error('Error:', err.error);
        }
      });
    } else {
      this.errorMessage = 'Invalid or missing reset token.';
    }
  }
}
