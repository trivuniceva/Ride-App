import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Ride } from '../../core/models/ride.model';
import { RideService } from '../../core/services/ride/ride.service';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';
import { User } from '../../core/models/user.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RideDetailsDialogComponent } from '../ride-details-dialog/ride-details-dialog.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartData } from 'chart.js';
import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from 'chart.js';
import { FavoriteRouteService, FavoriteRoute } from '../../core/services/favorite-route/favorite-route.service';
import { PointDTO } from '../../core/models/PointDTO.model'; 

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

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
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    BaseChartDirective,
  ],
  styleUrls: ['./ride-history.component.css']
})
export class RideHistoryComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<Ride>();
  loggedUser: User | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  allRides: Ride[] = [];
  userFavoriteRoutes: FavoriteRoute[] = [];


  @ViewChild(MatSort) sort!: MatSort;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  showCharts: boolean = false;

  ridesPerDayChartData: ChartData<'line'> = { datasets: [], labels: [] };
  ridesPerDayChartLabels: string[] = [];
  ridesPerDayChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Broj vožnji po danima',
        font: { size: 16 }
      }
    }
  };
  ridesPerDayChartType: ChartType = 'line';

  kilometersPerDayChartData: ChartData<'line'> = { datasets: [], labels: [] };
  kilometersPerDayChartLabels: string[] = [];
  kilometersPerDayChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Pređeni kilometri po danima',
        font: { size: 16 }
      }
    }
  };
  kilometersPerDayChartType: ChartType = 'line';

  moneyPerDayChartData: ChartData<'line'> = { datasets: [], labels: [] };
  moneyPerDayChartLabels: string[] = [];
  moneyPerDayChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Potrošen/Zarađen novac po danima',
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: string | number) {
            return value + ' RSD';
          }
        }
      }
    }
  };
  moneyPerDayChartType: ChartType = 'line';

  totalRides: number = 0;
  totalKilometers: number = 0;
  totalMoney: number = 0;
  averageRidesPerDay: number = 0;
  averageKilometersPerDay: number = 0;
  averageMoneyPerDay: number = 0;

  constructor(
    private rideService: RideService,
    private authService: AuthService,
    private dialog: MatDialog,
    private favoriteRouteService: FavoriteRouteService
  ) { }

  ngOnInit(): void {
    this.authService.getLoggedUser().subscribe(user => {
      this.loggedUser = user;
      if (this.loggedUser) {
        this.displayedColumns = ['route', 'fullPrice', 'createdAt', 'rideStatus'];

        if (this.loggedUser.userRole === 'REGISTERED_USER') {
          this.displayedColumns.push('favorite');
        }

        this.displayedColumns.push('details');
        this.loadRideHistory();
        this.loadFavoriteRoutes();
      } else {
        this.isLoading = false;
        this.errorMessage = 'Korisnik nije ulogovan.';
      }
    });

    this.range.valueChanges.subscribe(() => {
      if (this.range.value.start !== null || this.range.value.end !== null) {
        this.filterAndProcessRides();
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
          this.allRides = rides.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
          this.filterAndProcessRides();
        } else {
          this.allRides = [];
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

  loadFavoriteRoutes(): void {
    if (!this.loggedUser || !this.loggedUser.email) {
      return;
    }
    this.favoriteRouteService.getFavoriteRoutes(this.loggedUser.email).subscribe({
      next: (favoriteRoutes: FavoriteRoute[]) => {
        this.userFavoriteRoutes = favoriteRoutes;
        console.log('Učitane omiljene rute:', this.userFavoriteRoutes);
      },
      error: (err) => {
        console.error('Greška pri učitavanju omiljenih ruta:', err);
      }
    });
  }


  filterAndProcessRides(): void {
    const startDate = this.range.value.start;
    const endDate = this.range.value.end;

    let filteredRides = [...this.allRides];

    if (startDate && endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);

      filteredRides = this.allRides.filter(ride => {
        const rideDate = new Date(ride.createdAt);
        return rideDate >= startDate && rideDate <= adjustedEndDate;
      });
    }

    this.dataSource.data = filteredRides;
    this.processChartData(filteredRides);
  }

  clearDateRange(): void {
    this.range.reset();
    this.filterAndProcessRides();
  }

  processChartData(rides: Ride[]): void {
    const ridesPerDayMap = new Map<string, number>();
    const kilometersPerDayMap = new Map<string, number>();
    const moneyPerDayMap = new Map<string, number>();

    this.totalRides = 0;
    this.totalKilometers = 0;
    this.totalMoney = 0;

    rides.forEach(ride => {
      const dateKey = new Date(ride.createdAt).toISOString().split('T')[0];

      ridesPerDayMap.set(dateKey, (ridesPerDayMap.get(dateKey) || 0) + 1);
      this.totalRides++;

      const rideKilometers = ride.totalLength || 0;
      kilometersPerDayMap.set(dateKey, (kilometersPerDayMap.get(dateKey) || 0) + rideKilometers);
      this.totalKilometers += rideKilometers;

      const ridePrice = ride.fullPrice || 0;
      moneyPerDayMap.set(dateKey, (moneyPerDayMap.get(dateKey) || 0) + ridePrice);
      this.totalMoney += ridePrice;
    });

    const sortedDates = Array.from(new Set([
      ...Array.from(ridesPerDayMap.keys()),
      ...Array.from(kilometersPerDayMap.keys()),
      ...Array.from(moneyPerDayMap.keys())
    ])).sort();

    this.ridesPerDayChartData = {
      labels: sortedDates,
      datasets: [{
        data: sortedDates.map(date => ridesPerDayMap.get(date) || 0),
        label: 'Broj vožnji',
        fill: 'origin',
        tension: 0.3
      }]
    };

    this.kilometersPerDayChartData = {
      labels: sortedDates,
      datasets: [{
        data: sortedDates.map(date => kilometersPerDayMap.get(date) || 0),
        label: 'Pređeni kilometri',
        fill: 'origin',
        tension: 0.3
      }]
    };

    this.moneyPerDayChartData = {
      labels: sortedDates,
      datasets: [{
        data: sortedDates.map(date => moneyPerDayMap.get(date) || 0),
        label: 'Potrošen/Zarađen novac (RSD)',
        fill: 'origin',
        tension: 0.3
      }]
    };

    const numberOfDays = sortedDates.length;
    this.averageRidesPerDay = numberOfDays > 0 ? this.totalRides / numberOfDays : 0;
    this.averageKilometersPerDay = numberOfDays > 0 ? this.totalKilometers / numberOfDays : 0;
    this.averageMoneyPerDay = numberOfDays > 0 ? this.totalMoney / numberOfDays : 0;
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
    const dialogRef = this.dialog.open(RideDetailsDialogComponent, {
      width: '95vw',
      maxWidth: '1200px',
      height: '80vh',
      maxHeight: '90vh',
      panelClass: 'custom-ride-details-dialog',
      data: { ride: ride },
      autoFocus: true,
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'orderNow') {
      } else if (result === 'orderLater') {
      }
    });
  }

  toggleCharts(): void {
    this.showCharts = !this.showCharts;
  }

  toggleFavorite(ride: Ride): void {
    if (!this.loggedUser || !this.loggedUser.email) {
      console.warn('Nije moguće dodati/ukloniti omiljenu rutu: korisnik nije ulogovan.');
      return;
    }

    const existingFavorite = this.getExistingFavoriteRoute(ride);

    if (existingFavorite) {
      if (existingFavorite.id) {
        this.favoriteRouteService.removeFavoriteRoute(existingFavorite.id).subscribe({
          next: () => {
            console.log('Ruta uspešno uklonjena iz omiljenih:', ride);
            this.userFavoriteRoutes = this.userFavoriteRoutes.filter(fav => fav.id !== existingFavorite.id);
          },
          error: (err) => {
            console.error('Greška pri uklanjanju omiljene rute:', err);
          }
        });
      } else {
        console.warn('Pokušaj uklanjanja omiljene rute bez ID-a.', existingFavorite);
      }
    } else {
      const favoriteRouteData = this.mapRideToFavoriteRouteDTO(ride);
      this.favoriteRouteService.addFavoriteRoute(
        favoriteRouteData,
        { carriesBabies: ride.carriesBabies, carriesPets: ride.carriesPets },
        this.loggedUser.email
      ).subscribe({
        next: (response: any) => {
          console.log('Backend add favorite route response:', response);

          const newFavoriteRouteId = response.id;

          const newFavoriteRoute: FavoriteRoute = {
            ...favoriteRouteData,
            id: newFavoriteRouteId
          };

          this.userFavoriteRoutes.push(newFavoriteRoute);
          console.log('Ruta uspešno dodata u omiljene (UI osvežen):', newFavoriteRoute);

        },
        error: (err) => {
          console.error('Greška pri dodavanju omiljene rute:', err);
        }
      });
    }
  }

  isFavorite(ride: Ride): boolean {
    return !!this.getExistingFavoriteRoute(ride);
  }

  private getExistingFavoriteRoute(ride: Ride): FavoriteRoute | undefined {
    // Proverava da li postoji omiljena ruta sa istim ključnim karakteristikama
    return this.userFavoriteRoutes.find(favRoute =>
      favRoute.userEmail === this.loggedUser?.email &&
      favRoute.startAddress === ride.startAddress &&
      favRoute.destinationAddress === ride.destinationAddress &&
      this.areStopsEqual(favRoute.stops, ride.stops) &&
      favRoute.vehicleType === ride.vehicleType &&
      favRoute.carriesBabies === ride.carriesBabies &&
      favRoute.carriesPets === ride.carriesPets
    );
  }

  private areStopsEqual(stops1: string[] | null, stops2: string[] | null): boolean {
    if (stops1 === stops2) return true;
    if (!stops1 || !stops2) return false;
    if (stops1.length !== stops2.length) return false;

    for (let i = 0; i < stops1.length; i++) {
      if (stops1[i] !== stops2[i]) return false;
    }
    return true;
  }

  private mapRideToFavoriteRouteDTO(ride: Ride): FavoriteRoute {
    const startLocationDTO: PointDTO | null = ride.startLocation ? {
      id: ride.startLocation.id,
      latitude: ride.startLocation.latitude,
      longitude: ride.startLocation.longitude
    } : null;

    const destinationLocationDTO: PointDTO | null = ride.destinationLocation ? {
      id: ride.destinationLocation.id,
      latitude: ride.destinationLocation.latitude,
      longitude: ride.destinationLocation.longitude
    } : null;

    const stopLocationsDTO: PointDTO[] = ride.stopLocations ?
      ride.stopLocations.map(p => ({
        id: p.id,
        latitude: p.latitude,
        longitude: p.longitude
      })) : [];

    return {
      userEmail: this.loggedUser!.email,
      startAddress: ride.startAddress,
      stops: ride.stops,
      destinationAddress: ride.destinationAddress,
      startLocation: startLocationDTO,
      stopLocations: stopLocationsDTO,
      destinationLocation: destinationLocationDTO,
      vehicleType: ride.vehicleType,
      carriesBabies: ride.carriesBabies,
      carriesPets: ride.carriesPets,
    };
  }
}
