import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, Observable, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/reset-password`, {
      token: token,
      newPassword: newPassword
    }).pipe(
      catchError(error => {
        return throwError(error);
      })
    );
  }

  // Ispravljen URL da uključuje rideId i driverId
  acceptRide(rideId: number, driverId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/rides/accept/${rideId}/${driverId}`, {});
  }

  // Ispravljen URL da uključuje rideId i driverId
  rejectRide(rideId: number, driverId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/rides/reject/${rideId}/${driverId}`, {});
  }
}
