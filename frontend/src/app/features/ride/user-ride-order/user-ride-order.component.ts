import { Component } from '@angular/core';
import {RideOrderComponent} from '../ride-order/ride-order.component';

@Component({
  selector: 'app-user-ride-order',
  standalone: true,
  imports: [
    RideOrderComponent
  ],
  templateUrl: './user-ride-order.component.html',
  styleUrl: './user-ride-order.component.css'
})
export class UserRideOrderComponent {

}
