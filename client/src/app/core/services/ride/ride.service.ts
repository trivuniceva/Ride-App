import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Driver} from '../../models/driver.model';

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private apiUrl = 'http://localhost:8080/rides';

  constructor(private http: HttpClient) { }

  getActiveRides(): Observable<Driver[]> {
    return this.http.get<Driver[]>(this.apiUrl + '/active');
  }

  createRide(rideData: any): Observable<any> {
    return this.http.post(this.apiUrl, rideData);
  }
}
