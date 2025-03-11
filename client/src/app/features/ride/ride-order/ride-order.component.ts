import { Component, OnInit } from '@angular/core';
import { MapComponent } from "../../map/map.component";
import { RouteFormComponent } from "../route-form/route-form.component";
import { AuthService } from '../../../core/services/auth/auth.service';
import { NgIf } from '@angular/common';
import { AdvancedRouteFormComponent } from '../advanced-route-form/advanced-route-form.component';
import { DriversAvailabilityComponent } from '../../drivers/drivers-availability/drivers-availability.component';
import {RouteService} from '../../../core/services/route/route.service';

@Component({
  selector: 'app-ride-order',
  standalone: true,
  imports: [
    MapComponent,
    RouteFormComponent,
    NgIf,
    AdvancedRouteFormComponent,
    DriversAvailabilityComponent,
  ],
  templateUrl: './ride-order.component.html',
  styleUrls: ['./ride-order.component.css']
})
export class RideOrderComponent implements OnInit {
  userRole: string = '';
  shortestRoutes: any[] = [];

  constructor(private authService: AuthService, private routeService: RouteService) {}

  ngOnInit(): void {
    this.authService.userRole$.subscribe((role) => {
      this.userRole = role;
    });
  }

  handleRouteData(routeData: { startAddress: string, destinationAddress: string }): void {
    console.log(routeData); // Ovo možeš zameniti sa pozivom servisa za prikaz putanja
    this.routeService.getShortestRoutes(routeData.startAddress, routeData.destinationAddress).subscribe(
      (routes) => {
        this.shortestRoutes = routes;  // Spremamo rezultate putanja
        console.log('Pronađene putanje:', routes);
      },
      (error) => {
        console.error('Greška pri dobavljanju putanja:', error);
      }
    );
  }

  handleAdvancedRoutePreferences(preferences: any): void {
    console.log('User preferences:', preferences);
  }
}
