import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {VehicleType} from '../../models/VehicleType.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = 'http://localhost:8080/vehicle';
  private apiUrl2 = 'http://localhost:8080/vehicle-types';

  constructor(private http: HttpClient) { }

  registerDriver(userData: any): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/signup-driver`, userData).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(error);
      })
    );
  }

  getVehicleTypes(): Observable<VehicleType[]> {
    return this.http.get<VehicleType[]>(`${this.apiUrl2}`);
  }

}
