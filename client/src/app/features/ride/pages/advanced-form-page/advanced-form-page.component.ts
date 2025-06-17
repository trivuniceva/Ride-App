import {Component, EventEmitter, Output, ViewChild, AfterViewInit, Input} from '@angular/core';
import { NgIf } from '@angular/common';
import { RouteFormComponent } from '../../components/route-form/route-form.component';
import { VehicleTypeComponent } from '../../components/vehicle-type/vehicle-type.component';
import { AdditionalOptionsComponent } from '../../components/additional-options/additional-options.component';
import { SplitFareComponent } from '../../components/split-fare/split-fare.component';
import { RideSummaryComponent } from '../../components/ride-summary/ride-summary.component';
import { RideService } from '../../../../core/services/ride/ride.service';
import {PointDTO} from '../../../../core/models/PointDTO.model';
import {PaymentTrackingComponent} from '../../components/payment-tracking/payment-tracking.component';


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
    PaymentTrackingComponent,
  ],
  templateUrl: './advanced-form-page.component.html',
  styleUrl: './advanced-form-page.component.css',
})
export class AdvancedFormPageComponent implements AfterViewInit {
  @Input() fullPrice: number | undefined;

  currentStep: number = 1;
  additionalOptions: { carriesBabies: boolean; carriesPets: boolean } = { carriesBabies: false, carriesPets: false };
  passengers: string[] = [];
  vehicleType: string | null = null;
  showPopup = false;
  splitFareEmails: string[] = [];
  private requestorEmail: string = '';

  showTrackingPopup: boolean = false;
  trackingMessage: string = '';

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

  constructor(private rideService: RideService) {}

  ngAfterViewInit(): void {
    if (this.vehicleType) {
      this.showRoute();
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
    this.splitFareEmails = passengers.filter(email => email !== this.requestorEmail); // Primer: svi osim trenutnog korisnika plaćaju split fare
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
          this.showTrackingPopup = true;
          this.trackingMessage = 'Hvala na porudžbini! Vaše vozilo uskoro stiže na adresu.';

        },
        error: (error: any) => {
          console.error('Error sending ride request', error);
          this.handlePopupClosed();
          this.showTrackingPopup = true;
          this.trackingMessage = 'Došlo je do greške prilikom naručivanja vožnje. Molimo pokušajte ponovo.';

        }
      });
    } else {
      console.error('Cannot send ride request: Start or destination location coordinates are missing.');
      this.handlePopupClosed();
      this.showTrackingPopup = true;
      this.trackingMessage = 'Nije moguće naručiti vožnju: nedostaju početna ili krajnja lokacija.';

    }
  }

  handlePopupClosed() {
    this.showPopup = false;
  }

  onTrackingPopupClosed() {
    this.showTrackingPopup = false;
  }
}
