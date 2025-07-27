import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {Driver} from '../../models/driver.model';
import {BlockUserRequest} from '../../models/block-user-request.model';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private driverApiUrl = 'http://localhost:8080/driver';

  constructor(private http: HttpClient) { }

  getDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${this.driverApiUrl}/all`).pipe(
      catchError(error => {
        console.error('Error in getAllDrivers:', error);
        return throwError(() => new Error('Failed to fetch drivers.'));
      })
    );
  }

  blockDriver(request: BlockUserRequest): Observable<Driver> {
    return this.http.post<Driver>(`${this.driverApiUrl}/block`, request).pipe(
      catchError(error => {
        console.error('Error in blockDriver:', error);
        return throwError(() => new Error('Failed to block/unblock driver.'));
      })
    );
  }

  getDriverById(driverId: number): Observable<Driver> {
    return this.http.get<Driver>(`${this.driverApiUrl}/${driverId}`).pipe(
      catchError(error => {
        console.error(`Error in getDriverById for ID ${driverId}:`, error);
        return throwError(() => new Error(`Failed to fetch driver with ID ${driverId}.`));
      })
    );
  }
}
