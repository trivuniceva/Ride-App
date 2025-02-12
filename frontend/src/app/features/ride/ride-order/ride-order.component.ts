import {Component, OnInit} from '@angular/core';
import {MapComponent} from "../../map/map.component";
import {RouteFormComponent} from "../route-form/route-form.component";
import {AuthService} from '../../../core/services/auth/auth.service';
import {NgIf} from '@angular/common';
import {AdvancedRouteFormComponent} from '../advanced-route-form/advanced-route-form.component';

@Component({
  selector: 'app-ride-order',
  standalone: true,
  imports: [
    MapComponent,
    RouteFormComponent,
    NgIf,
    AdvancedRouteFormComponent,
  ],
  templateUrl: './ride-order.component.html',
  styleUrl: './ride-order.component.css'
})
export class RideOrderComponent implements OnInit{
  userRole: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.userRole$.subscribe((role) => {
      this.userRole = role;
    });
  }


  handleRouteData(routeData: { startAddress: string, destinationAddress: string }): void {
    console.log('Polazište:', routeData.startAddress);
    console.log('Destinacija:', routeData.destinationAddress);
  }

  handleAdvancedRoutePreferences(preferences: any) {
    console.log('User preferences:', preferences);
    // You can send this data to the backend or use it elsewhere
  }
}
