import {Component, EventEmitter, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-login-form',
    standalone: true,
    imports: [
        FormsModule
    ],
    templateUrl: './login-form.component.html',
    styleUrl: './login-form.component.css'
})
export class LoginFormComponent {

  email: string = '';
  password: string = '';

  @Output() loginEvent = new EventEmitter<{ email: string; password: string }>();

  login() {
    this.loginEvent.emit({ email: this.email, password: this.password });
  }

}
