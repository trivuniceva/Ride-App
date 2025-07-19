import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild, EventEmitter, Output, Input} from '@angular/core';
import { NgIf, CurrencyPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { RouteFormComponent } from '../../components/route-form/route-form.component';
import { VehicleTypeComponent } from '../../components/vehicle-type/vehicle-type.component';
import { AdditionalOptionsComponent } from '../../components/additional-options/additional-options.component';
import { SplitFareComponent } from '../../components/split-fare/split-fare.component';
import { RideSummaryComponent } from '../../components/ride-summary/ride-summary.component';

import { WebSocketService } from '../../../../core/services/web-socket.service';
import {PointDTO} from '../../../../core/models/PointDTO.model';
import {RideService} from '../../../../core/services/ride/ride.service';
import {AuthService} from '../../../../core/services/auth/auth.service';
import {FavoriteRouteService} from '../../../../core/services/favorite-route/favorite-route.service';
import {User} from '../../../../core/models/user.model';
import {RideTrackingPopupComponent} from '../../components/ride-tracking-popup/ride-tracking-popup.component';

@Component({
  selector: 'app-advanced-form-page',
  standalone: true,
  imports: [
    NgIf,
    RouteFormComponent,
    VehicleTypeComponent,
    AdditionalOptionsComponent,
    SplitFareComponent,
    RideSummaryComponent,
    RideTrackingPopupComponent
  ],
  templateUrl: './advanced-form-page.component.html',
  styleUrl: './advanced-form-page.component.css',
})
export class AdvancedFormPageComponent implements OnInit, AfterViewInit, OnDestroy {
  currentStep: number = 1;
  additionalOptions: { carriesBabies: boolean; carriesPets: boolean } = { carriesBabies: false, carriesPets: false };
  passengers: string[] = [];
  vehicleType: string | null = null;
  showPopup = false;
  splitFareEmails: string[] = [];
  private requestorEmail: string = '';
  private currentUserId: number | null = null;

  showRideTrackingPopup: boolean = false;
  rideTrackingMessage: string = '';
  driverName: string | null = null;
  currentRideId: number | null = null;
  driverPictureUrl: string | null = null;

  @Input() fullPrice: number | undefined;

  @ViewChild('routeForm') routeForm!: RouteFormComponent;

  @Output() routeDataSubmitted = new EventEmitter<{
    startAddress: string;
    stops: string[];
    destinationAddress: string;
    startLocation: PointDTO | null;
    stopLocations: PointDTO[];
    destinationLocation: PointDTO | null;
    vehicleType: string | null;
  }>();

  routeData: {
    startAddress: string;
    stops: string[];
    destinationAddress: string;
    startLocation: PointDTO | null;
    stopLocations: PointDTO[];
    destinationLocation: PointDTO | null;
    vehicleType: string | null;
  } = {
    startAddress: '',
    stops: [],
    destinationAddress: '',
    startLocation: null,
    stopLocations: [],
    destinationLocation: null,
    vehicleType: null,
  };

  private authSubscription: Subscription | undefined;
  private wsSubscription: Subscription | undefined;

  constructor(
    private rideService: RideService,
    private authService: AuthService,
    private favoriteRouteService: FavoriteRouteService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.getLoggedUser().subscribe((user: User | null) => {
      if (user && user.id && user.email) {
        this.requestorEmail = user.email;
        this.currentUserId = user.id;
        if (user.userRole === 'REGISTERED_USER') {
          if (this.wsSubscription === undefined || this.wsSubscription.closed || (this.currentUserId && this.webSocketService.isWebSocketConnected() && (!this.wsSubscription || this.wsSubscription.closed))) {
            this.subscribeToRideNotifications(user.id);
          }
        }
      } else {
        this.requestorEmail = '';
        this.currentUserId = null;
        if (this.wsSubscription) {
          this.wsSubscription.unsubscribe();
          this.wsSubscription = undefined;
        }
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.vehicleType) {
      this.showRoute();
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  processPayment() {
    this.showPopup = true;
  }

  handleOptionsChange(options: { carriesBabies: boolean; carriesPets: boolean }) {
    this.additionalOptions = options;
  }

  handlePassengersAdded(passengers: string[]) {
    this.passengers = passengers;
    this.splitFareEmails = passengers.filter(email => email !== this.requestorEmail);
    console.log('Passengers added:', this.passengers);
    console.log('Split Fare Emails:', this.splitFareEmails);
  }

  showRoute(): void {
    if (this.routeForm) {
      const routeData = {
        startAddress: this.routeForm.startAddressValue,
        stops: this.routeForm.stops,
        destinationAddress: this.routeForm.destinationAddressValue,
        startLocation: this.routeForm.startLocationValue,
        stopLocations: this.routeForm.stopLocations,
        destinationLocation: this.routeForm.destinationLocationValue,
        vehicleType: this.vehicleType,
      };
      this.handleRouteData(routeData);
    }
  }

  handleRouteData(routeData: {
    startAddress: string;
    stops: string[];
    destinationAddress: string;
    startLocation: PointDTO | null;
    stopLocations: PointDTO[];
    destinationLocation: PointDTO | null;
    vehicleType: string | null;
  }): void {
    this.routeData = routeData;
    console.log('Route Data with Coordinates: ->>>>>', this.routeData);
    this.routeDataSubmitted.emit(routeData);
  }

  handleVehicleTypeSelected(selectedType: string) {
    console.log(selectedType);
    this.vehicleType = selectedType;
    if (this.routeForm) {
      this.showRoute();
    }
  }

  handlePaymentConfirmation() {
    console.log('Payment has been confirmed in AdvancedFormPageComponent');
    console.log('Final object to be sent to backend:', this.routeData);

    if (this.routeData.startLocation && this.routeData.destinationLocation) {
      this.rideService.createRide(
        this.routeData,
        this.additionalOptions,
        this.passengers,
        this.fullPrice || 0,
        this.splitFareEmails.length > 0 ? 'PENDING' : 'PAID',
        this.requestorEmail
      ).subscribe({
        next: (response: any) => {
          console.log('Ride request sent successfully', response);
          this.handlePopupClosed();
          this.currentRideId = Number(response.rideId);
          this.showRideTrackingPopup = true;
          this.rideTrackingMessage = 'Zahtev za vožnju poslat. Čeka se odgovor vozača...';
          this.driverName = null;
          this.driverPictureUrl = null;
        },
        error: (error: any) => {
          console.error('Error sending ride request', error);
          this.handlePopupClosed();
          this.showRideTrackingPopup = true;
          this.rideTrackingMessage = 'Došlo je do greške prilikom naručivanja vožnje. Molimo pokušajte ponovo.';
          this.driverName = null;
          this.driverPictureUrl = null;
        }
      });
    } else {
      console.error('Cannot send ride request: Start or destination location coordinates are missing.');
      this.handlePopupClosed();
      this.showRideTrackingPopup = true;
      this.rideTrackingMessage = 'Nije moguće naručiti vožnju: nedostaju početna ili krajnja lokacija.';
      this.driverName = null;
      this.driverPictureUrl = null;
    }
  }

  handlePopupClosed() {
    this.showPopup = false;
  }

  onRideTrackingPopupClosed() {
    this.showRideTrackingPopup = false;
    this.rideTrackingMessage = '';
    this.driverName = null;
    this.currentRideId = null;
    this.driverPictureUrl = null;
  }

  handleFavoriteToggle(event: { routeData: any, additionalOptions: any, isFavorite: boolean }): void {
    if (event.isFavorite) {
      this.favoriteRouteService.addFavoriteRoute(event.routeData, event.additionalOptions, this.requestorEmail).subscribe({
        next: (response) => console.log('Ruta dodata u omiljene:', response),
        error: (error) => console.error('Greška pri dodavanju omiljene rute:', error)
      });
    } else {
      console.log('Ruta uklonjena iz omiljenih. Implementacija brisanja na backendu je potrebna.');
    }
  }

  private subscribeToRideNotifications(userId: number): void {
    if (this.wsSubscription && !this.wsSubscription.closed) {
      return;
    }

    this.wsSubscription = this.webSocketService.subscribeToUserTopic(userId).subscribe({
      next: (notification: any) => {
        const isRideIdMatching = this.currentRideId !== null && String(notification.rideId) === String(this.currentRideId);

        if (isRideIdMatching) {
          switch (notification.type) {
            case 'RIDE_REQUEST_SENT':
              this.showRideTrackingPopup = true;
              this.rideTrackingMessage = 'Zahtev za vožnju poslat. Čeka se odgovor vozača...';
              this.driverName = null;
              this.driverPictureUrl = null;
              break;
            case 'DRIVER_SEARCHING':
              this.showRideTrackingPopup = true;
              this.rideTrackingMessage = 'Traži se vozač za vašu vožnju...';
              this.driverName = null;
              this.driverPictureUrl = null;
              break;
            case 'DRIVER_ACCEPTED_RIDE':
              this.showRideTrackingPopup = true;
              this.rideTrackingMessage = `Vozač ${notification.driverFirstname} ${notification.driverLastname} je prihvatio vašu vožnju! Stiže uskoro!`;
              this.driverName = `${notification.driverFirstname} ${notification.driverLastname}`;
              this.driverPictureUrl = notification.driverPictureUrl;
              break;
            case 'NO_DRIVER_AVAILABLE':
              this.showRideTrackingPopup = true;
              this.rideTrackingMessage = `Trenutno nema dostupnih vozača za vašu vožnju. Molimo pokušajte ponovo kasnije.`;
              this.driverName = null;
              this.driverPictureUrl = null;
              break;
            default:
              break;
          }
        } else if (this.currentRideId === null) {
        } else {
        }
      },
      error: (err) => {
        console.error('Greška pri primanju notifikacija o vožnji:', err);
      },
      complete: () => {
      }
    });
  }
}
