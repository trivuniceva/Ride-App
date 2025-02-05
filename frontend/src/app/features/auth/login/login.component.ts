import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";

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

    constructor( private router: Router) { }

    login() {

    }

    forgotPassword() {

    }

    goToSignup() {
        this.router.navigate(['/signup'])
    }


}
