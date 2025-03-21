import { Component, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouteFormComponent } from '../../components/route-form/route-form.component';
import { VehicleTypeComponent } from '../../components/vehicle-type/vehicle-type.component';
import { AdditionalOptionsComponent } from '../../components/additional-options/additional-options.component';
import { SplitFareComponent } from '../../components/split-fare/split-fare.component';

@Component({
  selector: 'app-advanced-form-page',
  standalone: true,
  imports: [
    NgIf,
    RouteFormComponent,
    VehicleTypeComponent,
    AdditionalOptionsComponent,
    SplitFareComponent,
  ],
  templateUrl: './advanced-form-page.component.html',
  styleUrl: './advanced-form-page.component.css',
})
export class AdvancedFormPageComponent implements AfterViewInit {
  currentStep: number = 1;
  additionalOptions: { carriesBabies: boolean; carriesPets: boolean } = { carriesBabies: false, carriesPets: false };
  passengers: string[] = [];
  vehicleType: string | null = null;

  @ViewChild('routeForm') routeForm!: RouteFormComponent;

  @Output() routeDataSubmitted = new EventEmitter<{
    startAddress: string;
    stops: string[];
    destinationAddress: string;
    vehicleType: string | null;
  }>();

  ngAfterViewInit(): void {
    if (this.vehicleType) {
      this.showRoute();
    }
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  processPayment() {
    // Implementirajte logiku plaćanja
  }

  handleOptionsChange(options: { carriesBabies: boolean; carriesPets: boolean }) {
    this.additionalOptions = options;
  }

  handlePassengersAdded(passengers: string[]) {
    this.passengers = passengers;
    console.log('Passengers added:', this.passengers);
  }

  showRoute(): void {
    if (this.routeForm) {
      const routeData = {
        startAddress: this.routeForm.startAddressValue,
        stops: this.routeForm.stops,
        destinationAddress: this.routeForm.destinationAddressValue,
        vehicleType: this.vehicleType,
      };
      this.handleRouteData(routeData);
    }
  }

  routeData: {
    startAddress: string;
    stops: string[];
    destinationAddress: string;
    vehicleType: string | null;
  } = {
    startAddress: '',
    stops: [],
    destinationAddress: '',
    vehicleType: null,
  };

  handleRouteData(routeData: {
    startAddress: string;
    stops: string[];
    destinationAddress: string;
    vehicleType: string | null;
  }): void {
    this.routeData = routeData;
    console.log('routeData u advanced-form-page', this.routeData);
    this.routeDataSubmitted.emit(routeData);
  }

  handleVehicleTypeSelected(selectedType: string) {
    console.log(selectedType);
    this.vehicleType = selectedType;
    if (this.routeForm) {
      this.showRoute();
    }
  }
}
