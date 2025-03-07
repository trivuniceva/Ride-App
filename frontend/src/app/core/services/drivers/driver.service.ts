import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Driver} from '../../models/driver.model';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private apiUrl = 'http://localhost:8080/drivers';

  constructor(private http: HttpClient) {}

  getDrivers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
