import { Routes } from '@angular/router';
import {LoginComponent} from "./features/auth/login/login.component";
import {HomeComponent} from "./pages/home/home.component";
import {RegistrationComponent} from "./features/auth/registration/registration.component";


export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: RegistrationComponent},
];
