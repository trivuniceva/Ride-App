import { Component } from '@angular/core';
import {MapComponent} from "../map/map.component";

@Component({
  selector: 'app-ride-order',
  standalone: true,
    imports: [
        MapComponent
    ],
  templateUrl: './ride-order.component.html',
  styleUrl: './ride-order.component.css'
})
export class RideOrderComponent {

}
