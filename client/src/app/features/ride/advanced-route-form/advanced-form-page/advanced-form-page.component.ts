import { Component } from '@angular/core';
import {NgIf} from '@angular/common';
import {RouteFormComponent} from '../../route-form/route-form.component';
import {VehicleTypeComponent} from '../../vehicle-type/vehicle-type.component';

@Component({
  selector: 'app-advanced-form-page',
  standalone: true,
  imports: [
    NgIf,
    RouteFormComponent,
    VehicleTypeComponent,
  ],
  templateUrl: './advanced-form-page.component.html',
  styleUrl: './advanced-form-page.component.css'
})
export class AdvancedFormPageComponent {

  currentStep: number = 1;

  goToStep(step: number): void {
    this.currentStep = step;
  }

  processPayment() {

  }
}
