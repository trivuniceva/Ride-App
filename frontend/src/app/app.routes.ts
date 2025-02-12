import { Routes } from '@angular/router';
import {LoginComponent} from "./features/auth/login/login.component";
import {HomeComponent} from "./pages/home/home.component";
import {RegistrationComponent} from "./features/auth/registration/registration.component";
import {RideOrderComponent} from "./features/ride/ride-order/ride-order.component";
import {UserProfileComponent} from "./features/user-profile/user-profile.component";
import {UserRideOrderComponent} from './features/ride/user-ride-order/user-ride-order.component';


export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: RegistrationComponent},
    {path: 'ride', component: RideOrderComponent},
    {path: 'profile', component: UserProfileComponent},
    {path: 'order-ride', component: UserRideOrderComponent},

];
