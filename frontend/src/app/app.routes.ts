import { Routes } from '@angular/router';
import {LoginComponent} from "./features/auth/pages/login/login.component";
import {HomeComponent} from "./pages/home/home.component";
import {RegistrationComponent} from "./features/auth/pages/registration/registration.component";
import {RideOrderComponent} from "./features/ride/ride-order/ride-order.component";
import {UserProfileComponent} from "./features/user-profile/user-profile.component";
import {ForgotPasswordComponent} from './features/auth/pages/forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './features/auth/pages/reset-password/reset-password.component';
import {CreateDriverComponent} from './features/admin/create-driver/create-driver.component';


export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: RegistrationComponent},
    {path: 'ride', component: RideOrderComponent},
    {path: 'profile', component: UserProfileComponent},
    {path: 'order-ride', component: RideOrderComponent},
    {path: 'forgot-password', component: ForgotPasswordComponent},
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'create-driver', component: CreateDriverComponent },


];
