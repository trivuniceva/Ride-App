import {Component, OnInit} from '@angular/core';
import {DriverService} from '../../../core/services/drivers/driver.service';
import {Driver} from '../../../core/models/driver.model';
import {CommonModule, DatePipe, NgClass} from '@angular/common';

@Component({
  selector: 'app-drivers-availability',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    CommonModule
  ],
  templateUrl: './drivers-availability.component.html',
  styleUrl: './drivers-availability.component.css'
})
export class DriversAvailabilityComponent implements OnInit{
  drivers: Driver[] = [];

  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    this.driverService.getDrivers().subscribe((data) => {
      this.drivers = data;
    });
  }

}
