import { Component } from '@angular/core';
import {MapComponent} from "../../map/map.component";
import {RouteFormComponent} from "../route-form/route-form.component";

@Component({
  selector: 'app-ride-order',
  standalone: true,
  imports: [
    MapComponent,
    RouteFormComponent
  ],
  templateUrl: './ride-order.component.html',
  styleUrl: './ride-order.component.css'
})
export class RideOrderComponent {


  handleRouteData(routeData: { startAddress: string, destinationAddress: string }): void {
    console.log('Polazište:', routeData.startAddress);
    console.log('Destinacija:', routeData.destinationAddress);
  }
}
