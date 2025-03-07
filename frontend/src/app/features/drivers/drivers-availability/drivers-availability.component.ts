import {Component, OnDestroy, OnInit} from '@angular/core';
import {DriverService} from '../../../core/services/drivers/driver.service';
import {Driver} from '../../../core/models/driver.model';
import {CommonModule, DatePipe, NgClass} from '@angular/common';
import {interval, Subscription} from 'rxjs';

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
export class DriversAvailabilityComponent implements OnInit, OnDestroy{
  drivers: Driver[] = [];
  remainingTimes: { [key: number]: string } = {};
  private intervalSubscription: Subscription | undefined;

  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    this.driverService.getDrivers().subscribe((data) => {
      this.drivers = data;
      this.calculateRemainingTimes();
      this.startTimer();
    });
  }

  ngOnDestroy(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe(); // Prekini interval kada se komponenta uništi
    }
  }

  calculateRemainingTimes(): void {
    this.drivers.forEach(driver => {
      if (driver.timeOfLogin) {
        const loginTime = new Date(driver.timeOfLogin).getTime();
        const endTime = loginTime + 8 * 60 * 60 * 1000; // 8 sati u milisekundama
        this.updateRemainingTime(driver.id, endTime);
      }
    });
  }

  startTimer(): void {
    this.intervalSubscription = interval(1000).subscribe(() => {
      this.calculateRemainingTimes();
    });
  }

  updateRemainingTime(driverId: number, endTime: number): void {
    const now = new Date().getTime();
    const remaining = endTime - now;

    if (remaining > 0) {
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      this.remainingTimes[driverId] = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    } else {
      this.remainingTimes[driverId] = '00:00:00';
    }
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

}
