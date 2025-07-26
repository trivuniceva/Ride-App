import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {Ride} from '../../core/models/ride.model';
import {RideService} from '../../core/services/ride/ride.service';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-ride-history',
  standalone: true,
  templateUrl: './ride-history.component.html',
  imports: [
    MatIcon,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ],
  styleUrls: ['./ride-history.component.css']
})
export class RideHistoryComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['route', 'fullPrice', 'createdAt', 'rideStatus', 'details'];
  dataSource = new MatTableDataSource<Ride>();

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private rideService: RideService) { }

  ngOnInit(): void {
    this.loadRideHistory();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  loadRideHistory(): void {
    this.rideService.getRideHistory().subscribe({
      next: (rides: Ride[]) => {
        const sortedRides = rides.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        this.dataSource.data = sortedRides;
      },
      error: (err) => {
        console.error('Greška pri učitavanju istorije vožnji:', err);
      }
    });
  }

  getRouteDisplay(ride: Ride): string {
    let route = ride.startAddress;
    if (ride.stops && ride.stops.length > 0) {
      route += ' -> ' + ride.stops.join(' -> ');
    }
    route += ' -> ' + ride.destinationAddress;
    return route;
  }

  showDetails(ride: Ride): void {
    console.log('Prikaz detalja za vožnju:', ride);
    alert(`Detalji vožnje ID: ${ride.id}\nRuta: ${this.getRouteDisplay(ride)}\nCena: ${ride.fullPrice} RSD\nStatus: ${ride.rideStatus}`);
  }
}
