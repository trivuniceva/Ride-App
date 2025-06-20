import { Routes } from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {LoginComponent} from './features/auth/pages/login/login.component';
import {RegistrationComponent} from './features/auth/pages/registration/registration.component';
import {RideOrderComponent} from './features/ride/pages/ride-order/ride-order.component';
import {UserProfileComponent} from './features/user-profile/user-profile.component';
import {ForgotPasswordComponent} from './features/auth/pages/forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './features/auth/pages/reset-password/reset-password.component';
import {CreateDriverComponent} from './features/admin/create-driver/create-driver.component';
import {DriverNotificationsComponent} from './features/drivers/driver-notifications/driver-notifications.component';
import {
  DriverRideTrackingMapComponent
} from './features/drivers/driver-ride-tracking-map/driver-ride-tracking-map.component';
import {UserManagementComponent} from './features/admin/user-management/user-management.component';
import {AdminChatComponent} from './features/admin-chat/admin-chat.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'signup', component: RegistrationComponent},
  {path: 'ride-preview', component: RideOrderComponent},
  {path: 'profile', component: UserProfileComponent},
  {path: 'order-ride', component: RideOrderComponent},
  {path: 'forgot-password', component: ForgotPasswordComponent},
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'create-driver', component: CreateDriverComponent },
  { path: 'notifications', component: DriverNotificationsComponent },
  { path: 'track-ride', component: DriverRideTrackingMapComponent },
  { path: 'block-users', component: UserManagementComponent },
  { path: 'admin-chat', component: AdminChatComponent },
];
