// src/app/core/services/ride-reorder/ride-reorder.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ride } from '../../models/ride.model'; // Uverite se da je putanja ispravna

@Injectable({
  providedIn: 'root'
})
export class RideReorderService {
  private rideToReorderSubject = new BehaviorSubject<Ride | null>(null);
  currentRideToReorder$: Observable<Ride | null> = this.rideToReorderSubject.asObservable();

  constructor() { }

  setRideToReorder(ride: Ride): void {
    this.rideToReorderSubject.next(ride);
  }

  clearRideToReorder(): void {
    this.rideToReorderSubject.next(null);
  }
}
