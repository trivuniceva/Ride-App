import { Component } from '@angular/core';
import {UserService} from "../../core/services/user/user.service";
import {Router} from "@angular/router";
import {AuthService} from "../../core/services/auth/auth.service";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {WebSocketService} from '../../core/services/web-socket.service';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [
        NgIf,
        FormsModule
    ],
    templateUrl: './user-profile.component.html',
    styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {

  user: any;
  isEditing = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private webSocketService: WebSocketService
    ) {}

  ngOnInit(): void {
    this.user = this.authService.getLoggedUser();
    console.log(this.user);

    if (this.user.userRole === 'DRIVER') {
      const driverId = this.user.id;

      this.webSocketService.connect(driverId, (msg: string) => {
        alert("🛎️ Nova vožnja: " + msg);
      });
    }
  }


  enableEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
  }

  saveChanges() {

  }

  onFileSelected($event: Event) {

  }

  deleteAcc() {
  }

}
