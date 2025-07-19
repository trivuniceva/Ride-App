import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {VehicleType} from '../../../../core/models/VehicleType.model';
import {VehicleService} from '../../../../core/services/vehicle/vehicle.service';
import {NgFor} from '@angular/common';

@Component({
  selector: 'app-vehicle-type',
  standalone: true,
  imports: [
    NgFor
  ],
  templateUrl: './vehicle-type.component.html',
  styleUrl: './vehicle-type.component.css'
})
export class VehicleTypeComponent implements OnInit{
  @Output() classSelected = new EventEmitter<string>();
  activeClass: string | null = null;
  vehicleTypes: VehicleType[] = [];

  constructor(private vehicleService: VehicleService) {
  }

  ngOnInit(): void {
    this.vehicleService.getVehicleTypes().subscribe((types) => {
      this.vehicleTypes = types;
    });
  }

  selectClass(className: string): void {
    this.activeClass = className;
    this.classSelected.emit(className);
  }

}
