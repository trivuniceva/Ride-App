import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, Observable, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/user';

  constructor(private http: HttpClient) { }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }


  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, {
      token: token,
      newPassword: newPassword
    }).pipe(
      catchError(error => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  acceptRideAsDriver(): Observable<string> {
    const rideRequest = JSON.parse(localStorage.getItem('lastRideRequest')!);
    console.log("Šaljem rideRequest:", rideRequest);
    return this.http.post('http://localhost:8080/rides/accept', rideRequest, { responseType: 'text' }); // Dodajemo responseType
  }

}
