import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { catchError, Observable, throwError } from 'rxjs';
import { User } from '../../models/user.model';
import { BlockUserRequest } from '../../models/block-user-request.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userApiUrl = 'http://localhost:8080/user';
  private rideApiUrl = 'http://localhost:8080/rides';

  constructor(private http: HttpClient) { }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.userApiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.userApiUrl}/reset-password`, {
      token: token,
      newPassword: newPassword
    }).pipe(
      catchError(error => {
        return throwError(error);
      })
    );
  }

  acceptRide(rideId: number, driverId: number): Observable<any> {
    return this.http.post(`${this.rideApiUrl}/accept/${rideId}/${driverId}`, {});
  }

  rejectRide(rideId: number, driverId: number): Observable<any> {
    return this.http.post(`${this.rideApiUrl}/reject/${rideId}/${driverId}`, {});
  }

  getAllRegisteredUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.userApiUrl}/registered`).pipe(
      catchError(error => {
        console.error('Error in getAllRegisteredUsers:', error);
        return throwError(() => new Error('Failed to fetch registered users.'));
      })
    );
  }

  blockUser(request: BlockUserRequest): Observable<User> {
    return this.http.post<User>(`${this.userApiUrl}/block`, request).pipe(
      catchError(error => {
        console.error('Error in blockUser:', error);
        return throwError(() => new Error('Failed to block/unblock user.'));
      })
    );
  }
}
