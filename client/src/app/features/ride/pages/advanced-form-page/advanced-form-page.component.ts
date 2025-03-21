import { Component } from '@angular/core';
import {NgIf} from '@angular/common';
import {RouteFormComponent} from '../../components/route-form/route-form.component';
import {VehicleTypeComponent} from '../../components/vehicle-type/vehicle-type.component';
import {AdditionalOptionsComponent} from '../../components/additional-options/additional-options.component';
import {SplitFareComponent} from '../../components/split-fare/split-fare.component';

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
  styleUrl: './advanced-form-page.component.css'
})
export class AdvancedFormPageComponent {
  currentStep: number = 1;
  additionalOptions: { carriesBabies: boolean, carriesPets: boolean } = { carriesBabies: false, carriesPets: false };
  passengers: string[] = [];

  goToStep(step: number): void {
    this.currentStep = step;
  }

  processPayment() {

  }

  handleOptionsChange(options: { carriesBabies: boolean, carriesPets: boolean }) {
    this.additionalOptions = options;
  }

  handlePassengersAdded(passengers: string[]) {
    this.passengers = passengers;
    console.log('Passengers added:', this.passengers);
  }
}
