import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {Ride} from '../../core/models/ride.model';
import {RideService} from '../../core/services/ride/ride.service';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../core/services/auth/auth.service';
import {User} from '../../core/models/user.model';

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
  loggedUser: User | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private rideService: RideService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.getLoggedUser().subscribe(user => {
      this.loggedUser = user;
      if (this.loggedUser) {
        this.loadRideHistory();
      } else {
        this.isLoading = false;
        this.errorMessage = 'Korisnik nije ulogovan.';
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  loadRideHistory(): void {
    if (!this.loggedUser || !this.loggedUser.id || !this.loggedUser.userRole) {
      this.errorMessage = 'Nije moguće dohvatiti informacije o ulogovanom korisniku.';
      this.isLoading = false;
      return;
    }

    const userId = this.loggedUser.id;
    const userRole = this.loggedUser.userRole;
    const userEmail = this.loggedUser.email;

    this.isLoading = true;
    this.errorMessage = null;

    this.rideService.getRideHistory(userId, userRole, userEmail).subscribe({
      next: (rides: Ride[]) => {
        if (rides && Array.isArray(rides)) {
          const sortedRides = rides.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime(); // najskorije prve
          });
          this.dataSource.data = sortedRides;
        } else {
          this.dataSource.data = [];
          this.errorMessage = 'Nema dostupnih vožnji ili neispravan format podataka.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Greška pri učitavanju istorije vožnji:', err);
        this.errorMessage = 'Došlo je do greške prilikom učitavanja istorije vožnji. Pokušajte ponovo.';
        this.isLoading = false;
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
