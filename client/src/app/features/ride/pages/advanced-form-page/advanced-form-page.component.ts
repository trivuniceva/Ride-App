import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild, EventEmitter, Output, Input, OnChanges, SimpleChanges} from '@angular/core';
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
import { Ride } from '../../../../core/models/ride.model';
import {RideReorderService} from '../../../../core/services/ride-reorder/ride-reorder-service.service';

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
  ],
  templateUrl: './advanced-form-page.component.html',
  styleUrl: './advanced-form-page.component.css',
})
export class AdvancedFormPageComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
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
  @Input() currentRideId: number | null = null;
  driverPictureUrl: string | null = null;

  @Output() activeDriverLocationChange = new EventEmitter<[number, number] | null>();
  @Output() activeDriverIdChange = new EventEmitter<number | null>();
  @Output() rideCreated = new EventEmitter<number | null>();

  @Input() fullPrice: number | undefined;
  @Input() startAddress: string | undefined;
  @Input() stops: string[] = [];
  @Input() destinationAddress: string | undefined;
  @Input() startLocation: [number, number] | null = null;
  @Input() stopLocations: [number, number][] = [];
  @Input() destinationLocation: [number, number] | null = null;
  @Input() totalLength: number | undefined;
  @Input() expectedTime: number | undefined;
  @Input() set vehicleTypeFromParent(value: string | null) {
    this.vehicleType = value;
  }

  @ViewChild('routeForm') routeForm!: RouteFormComponent;

  @Output() routeDataSubmitted = new EventEmitter<{
    startAddress: string;
    stops: string[];
    destinationAddress: string;
    startLocation: PointDTO | null;
    stopLocations: PointDTO[];
    destinationLocation: PointDTO | null;
    vehicleType: string | null;
    distance: number | undefined;
    duration: number | undefined;
  }>();
  @Output() showSummaryPopup = new EventEmitter<boolean>();


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
  private reorderSubscription: Subscription | undefined;

  constructor(
    private rideService: RideService,
    private authService: AuthService,
    private favoriteRouteService: FavoriteRouteService,
    private webSocketService: WebSocketService,
    private rideReorderService: RideReorderService
  ) {}

  ngOnInit(): void {
    console.log('DEBUG: AdvancedFormPageComponent ngOnInit - currentRideId (from input/initial):', this.currentRideId);
    this.authSubscription = this.authService.getLoggedUser().subscribe((user: User | null) => {
      if (user && user.id && user.email) {
        this.requestorEmail = user.email;
        this.currentUserId = user.id;
      } else {
        this.requestorEmail = '';
        this.currentUserId = null;
        if (this.wsSubscription) {
          this.wsSubscription.unsubscribe();
          this.wsSubscription = undefined;
        }
      }
    });

    this.reorderSubscription = this.rideReorderService.currentRideToReorder$.subscribe(ride => {
      if (ride) {
        this.populateFormWithRideData(ride);
        this.rideReorderService.clearRideToReorder();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentRideId']) {
      console.log('DEBUG: AdvancedFormPageComponent ngOnChanges - currentRideId changed from', changes['currentRideId'].previousValue, 'to', changes['currentRideId'].currentValue);

      if (this.currentRideId !== null && this.currentUserId !== null) {
        if (!this.wsSubscription || this.wsSubscription.closed) {
          this.subscribeToRideNotifications(this.currentUserId);
        }
      } else if (this.currentRideId === null && changes['currentRideId'].previousValue !== null) {
        this.onRideTrackingPopupClosed();
        if (this.wsSubscription) {
          this.wsSubscription.unsubscribe();
          this.wsSubscription = undefined;
        }
      }
    }
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    console.log('DEBUG: AdvancedFormPageComponent ngOnDestroy - currentRideId (before destroy):', this.currentRideId);
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.reorderSubscription) {
      this.reorderSubscription.unsubscribe();
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
    const routeDataToUse = this.routeData.startAddress ? this.routeData : {
      startAddress: this.routeForm.startAddressValue,
      stops: this.routeForm.stops,
      destinationAddress: this.routeForm.destinationAddressValue,
      startLocation: this.routeForm.startLocationValue,
      stopLocations: this.routeForm.stopLocations,
      destinationLocation: this.routeForm.destinationLocationValue,
      vehicleType: this.vehicleType,
    };
    this.handleRouteData(routeDataToUse);
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

    this.startAddress = routeData.startAddress;
    this.stops = routeData.stops;
    this.destinationAddress = routeData.destinationAddress;
    if (routeData.startLocation) {
      this.startLocation = [routeData.startLocation.latitude, routeData.startLocation.longitude];
    }
    this.stopLocations = routeData.stopLocations.map(loc => [loc.latitude, loc.longitude]);
    if (routeData.destinationLocation) {
      this.destinationLocation = [routeData.destinationLocation.latitude, routeData.destinationLocation.longitude];
    }
    this.vehicleType = routeData.vehicleType;

    this.routeDataSubmitted.emit({
      ...routeData,
      distance: this.totalLength,
      duration: this.expectedTime
    });
  }

  handleVehicleTypeSelected(selectedType: string) {
    console.log(selectedType);
    this.vehicleType = selectedType;
  }

  handlePaymentConfirmation() {
    console.log('Payment has been confirmed in AdvancedFormPageComponent');

    const startLocDTO: PointDTO | null = this.startLocation ? { latitude: this.startLocation[0], longitude: this.startLocation[1] } : null;
    const destLocDTO: PointDTO | null = this.destinationLocation ? { latitude: this.destinationLocation[0], longitude: this.destinationLocation[1] } : null;
    const stopLocDTOs: PointDTO[] = this.stopLocations.map(loc => ({ latitude: loc[0], longitude: loc[1] }));

    const rideServiceRouteData = {
      startAddress: this.startAddress || '',
      stops: this.stops,
      destinationAddress: this.destinationAddress || '',
      startLocation: startLocDTO,
      stopLocations: stopLocDTOs,
      destinationLocation: destLocDTO,
      vehicleType: this.vehicleType,
    };

    console.log('Final object to be sent to backend:', rideServiceRouteData);

    if (startLocDTO && destLocDTO) {
      this.rideService.createRide(
        rideServiceRouteData,
        this.additionalOptions,
        this.passengers,
        this.fullPrice || 0,
        this.splitFareEmails.length > 0 ? 'PENDING' : 'PAID',
        this.requestorEmail,
        this.totalLength,
        this.expectedTime
      ).subscribe({
        next: (response: any) => {
          console.log('Ride request sent successfully', response);
          this.handlePopupClosed();
          this.rideCreated.emit(Number(response.rideId));
          console.log('DEBUG: RideCreated event emitted with ID:', Number(response.rideId));
          this.showRideTrackingPopup = true;
          this.rideTrackingMessage = 'Zahtev za vožnju poslat. Čeka se odgovor vozača...';
          this.driverName = null;
          this.driverPictureUrl = null;
          this.activeDriverLocationChange.emit(null);
          this.activeDriverIdChange.emit(null);
        },
        error: (error: any) => {
          console.error('Error sending ride request', error);
          this.handlePopupClosed();
          this.showRideTrackingPopup = true;
          this.rideTrackingMessage = 'Došlo je do greške prilikom naručivanja vožnje. Molimo pokušajte ponovo.';
          this.driverName = null;
          this.driverPictureUrl = null;
          this.activeDriverLocationChange.emit(null);
          this.activeDriverIdChange.emit(null);
        }
      });
    } else {
      console.error('Cannot send ride request: Start or destination location coordinates are missing.');
      this.handlePopupClosed();
      this.showRideTrackingPopup = true;
      this.rideTrackingMessage = 'Nije moguće naručiti vožnju: nedostaju početna ili krajnja lokacija.';
      this.driverName = null;
      this.driverPictureUrl = null;
      this.activeDriverLocationChange.emit(null);
      this.activeDriverIdChange.emit(null);
    }
  }

  handlePopupClosed() {
    this.showPopup = false;
    this.showSummaryPopup.emit(false);
  }

  onRideTrackingPopupClosed() {
    this.showRideTrackingPopup = false;
    this.rideTrackingMessage = '';
    this.driverName = null;
    this.rideCreated.emit(null);
    console.log('DEBUG: onRideTrackingPopupClosed - RideCreated event emitted with null.');
    this.driverPictureUrl = null;
    this.activeDriverLocationChange.emit(null);
    this.activeDriverIdChange.emit(null);
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
        console.log('DEBUG: Notification received. currentRideId (component input):', this.currentRideId, 'notification.rideId:', notification.rideId);

        const isRideIdMatching = this.currentRideId !== null && String(notification.rideId) === String(this.currentRideId);

        if (isRideIdMatching) {
          switch (notification.type) {
            case 'RIDE_REQUEST_SENT':
              this.showRideTrackingPopup = true;
              this.rideTrackingMessage = 'Zahtev za vožnju poslat. Čeka se odgovor vozača...';
              this.driverName = null;
              this.driverPictureUrl = null;
              this.activeDriverLocationChange.emit(null);
              this.activeDriverIdChange.emit(null);
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
              this.activeDriverIdChange.emit(notification.driverId);
              break;
            case 'NO_DRIVER_AVAILABLE':
              this.showRideTrackingPopup = true;
              this.rideTrackingMessage = `Trenutno nema dostupnih vozača za vašu vožnju. Molimo pokušajte ponovo kasnije.`;
              this.driverName = null;
              this.driverPictureUrl = null;
              this.activeDriverLocationChange.emit(null);
              this.activeDriverIdChange.emit(null);
              this.rideCreated.emit(null);
              break;
            case 'DRIVER_EN_ROUTE':
              if (typeof notification.latitude === 'number' && typeof notification.longitude === 'number') {
                const driverLocation: [number, number] = [notification.latitude, notification.longitude];
                this.activeDriverLocationChange.emit(driverLocation);
                this.activeDriverIdChange.emit(notification.driverId);
                console.log(`Vozač ${notification.driverId} se kreće:`, driverLocation);
              } else {
                console.warn('DRIVER_EN_ROUTE notification missing valid latitude/longitude:', notification);
              }
              break;
            case 'RIDE_IN_PROGRESS':
              if (typeof notification.latitude === 'number' && typeof notification.longitude === 'number') {
                const driverLocation: [number, number] = [notification.latitude, notification.longitude];
                this.activeDriverLocationChange.emit(driverLocation);
                this.activeDriverIdChange.emit(notification.driverId);
                console.log(`Vozač ${notification.driverId} se kreće (RIDE_IN_PROGRESS):`, driverLocation);
              } else {
                console.warn('RIDE_IN_PROGRESS notification missing valid latitude/longitude:', notification);
              }
              break;
            case 'RIDE_COMPLETED':
              this.showRideTrackingPopup = true;
              this.rideTrackingMessage = 'Vaša vožnja je završena! Hvala vam.';
              this.driverName = null;
              this.driverPictureUrl = null;
              this.activeDriverLocationChange.emit(null);
              this.activeDriverIdChange.emit(null);
              this.rideCreated.emit(null);
              break;
            case 'RIDE_FAILED':
              this.showRideTrackingPopup = true;
              this.rideTrackingMessage = 'Vožnja nije uspela. Molimo kontaktirajte podršku.';
              this.driverName = null;
              this.driverPictureUrl = null;
              this.activeDriverLocationChange.emit(null);
              this.activeDriverIdChange.emit(null);
              this.rideCreated.emit(null);
              break;
            default:
              console.log('Nepoznata notifikacija:', notification.type, notification);
              break;
          }
        } else {
          console.log('DEBUG: Ignored notification for rideId', notification.rideId, 'because it does not match currentRideId (input):', this.currentRideId);
        }
      },
      error: (err) => {
        console.error('Greška pri primanju notifikacija o vožnji:', err);
      },
      complete: () => {
        console.log('WebSocket pretplata završena.');
      }
    });
  }

  private populateFormWithRideData(ride: Ride): void {
    console.log('Populating form with ride data for reorder:', ride);
    this.startAddress = ride.startAddress;
    this.stops = ride.stops || [];
    this.destinationAddress = ride.destinationAddress;

    if (ride.startLocation) {
      this.startLocation = [ride.startLocation.latitude, ride.startLocation.longitude];
    } else {
      this.startLocation = null;
    }

    this.stopLocations = ride.stopLocations?.map(p => [p.latitude, p.longitude]) || [];

    if (ride.destinationLocation) {
      this.destinationLocation = [ride.destinationLocation.latitude, ride.destinationLocation.longitude];
    } else {
      this.destinationLocation = null;
    }

    this.vehicleType = ride.vehicleType;
    this.additionalOptions = {
      carriesBabies: ride.carriesBabies,
      carriesPets: ride.carriesPets
    };
    this.passengers = ride.passengers || [this.requestorEmail];
    this.splitFareEmails = ride.passengers?.filter(email => email !== this.requestorEmail) || [];
    this.fullPrice = ride.fullPrice;
    this.totalLength = ride.totalLength;
    this.expectedTime = ride.expectedTime;

    this.routeData = {
      startAddress: this.startAddress,
      stops: this.stops,
      destinationAddress: this.destinationAddress,
      startLocation: this.startLocation ? { latitude: this.startLocation[0], longitude: this.startLocation[1] } : null,
      stopLocations: this.stopLocations.map(loc => ({ latitude: loc[0], longitude: loc[1] })),
      destinationLocation: this.destinationLocation ? { latitude: this.destinationLocation[0], longitude: this.destinationLocation[1] } : null,
      vehicleType: this.vehicleType,
    };

    this.handleRouteData(this.routeData);

    this.currentStep = 3;
    this.processPayment();
  }
}
