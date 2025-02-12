import { Component } from '@angular/core';
import {UserService} from "../../core/services/user/user.service";
import {Router} from "@angular/router";
import {AuthService} from "../../core/services/auth/auth.service";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";

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

  constructor(private userService: UserService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getLoggedUser()
    console.log(this.user)
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
