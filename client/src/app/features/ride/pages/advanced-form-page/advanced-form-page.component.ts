import { Component } from '@angular/core';
import {NgIf} from '@angular/common';
import {RouteFormComponent} from '../../components/route-form/route-form.component';
import {VehicleTypeComponent} from '../../components/vehicle-type/vehicle-type.component';
import {AdditionalOptionsComponent} from '../../components/additional-options/additional-options.component';

@Component({
  selector: 'app-advanced-form-page',
  standalone: true,
  imports: [
    NgIf,
    RouteFormComponent,
    VehicleTypeComponent,
    AdditionalOptionsComponent,
  ],
  templateUrl: './advanced-form-page.component.html',
  styleUrl: './advanced-form-page.component.css'
})
export class AdvancedFormPageComponent {
  currentStep: number = 1;
  additionalOptions: { carriesBabies: boolean, carriesPets: boolean } = { carriesBabies: false, carriesPets: false };


  goToStep(step: number): void {
    this.currentStep = step;
  }

  processPayment() {

  }

  handleOptionsChange(options: { carriesBabies: boolean, carriesPets: boolean }) {
    this.additionalOptions = options;
  }
}
