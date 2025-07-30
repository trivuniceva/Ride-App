import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { catchError, Observable, throwError } from 'rxjs';
import { User } from '../../models/user.model';
import { BlockUserRequest } from '../../models/block-user-request.model';
import {Driver} from '../../models/driver.model';

export interface DriverUpdateRequest {
  requestId: number;
  driverId: number;
  driverEmail: string;
  oldFirstname: string;
  newFirstname: string;
  oldLastname: string;
  newLastname: string;
  oldAddress: string;
  newAddress: string;
  oldPhone: string;
  newPhone: string;
  requestDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userApiUrl = 'http://localhost:8080/user';
  private rideApiUrl = 'http://localhost:8080/rides';
  private driverApiUrl = 'http://localhost:8080/driver';

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

  updateUserProfile(userId: number, userData: Partial<User>): Observable<any> {
    return this.http.put(`${this.userApiUrl}/${userId}`, userData).pipe(
      catchError(error => {
        console.error('Error updating user profile:', error);
        return throwError(() => new Error('Failed to update user profile.'));
      })
    );
  }

  changePassword(userId: number, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.userApiUrl}/${userId}/change-password`, { oldPassword, newPassword }).pipe(
      catchError(error => {
        console.error('Error changing password:', error);
        return throwError(() => new Error('Failed to change password.'));
      })
    );
  }

  uploadProfilePicture(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.userApiUrl}/${userId}/profile-picture`, formData).pipe(
      catchError(error => {
        console.error('Error uploading profile picture:', error);
        return throwError(() => new Error('Failed to upload profile picture.'));
      })
    );
  }

  getAllDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${this.userApiUrl}/drivers`).pipe(
      catchError(error => {
        console.error('Error in getAllDrivers:', error);
        return throwError(() => new Error('Failed to fetch drivers.'));
      })
    );
  }

  getPendingDriverUpdateRequests(): Observable<DriverUpdateRequest[]> {
    return this.http.get<DriverUpdateRequest[]>(`${this.userApiUrl}/driver-update-requests/pending`).pipe(
      catchError(error => {
        console.error('Error fetching pending driver update requests:', error);
        return throwError(() => new Error('Failed to fetch pending driver update requests.'));
      })
    );
  }

  approveDriverProfileUpdate(requestId: number): Observable<any> {
    return this.http.post(`${this.userApiUrl}/driver-update-requests/${requestId}/approve`, {}).pipe(
      catchError(error => {
        console.error('Error approving driver profile update:', error);
        return throwError(() => new Error('Failed to approve driver profile update.'));
      })
    );
  }

  rejectDriverProfileUpdate(requestId: number): Observable<any> {
    return this.http.post(`${this.userApiUrl}/driver-update-requests/${requestId}/reject`, {}).pipe(
      catchError(error => {
        console.error('Error rejecting driver profile update:', error);
        return throwError(() => new Error('Failed to reject driver profile update.'));
      })
    );
  }

  loggedDriver(driverId: number): Observable<any> {
    return this.http.post(
      `${this.driverApiUrl}/logged/${driverId}`,
      {},
      { responseType: 'text' }
    ).pipe(
      catchError(error => {
        console.error('Error logging driver on backend:', error);
        return throwError(() => new Error('Failed to log driver on backend. ' + (error.error || error.message)));
      })
    );
  }

  loggedOutDriver(driverId: number): Observable<any> {
    console.log(`Sending logout request for driver ID: ${driverId}`);
    return this.http.post(
      `${this.driverApiUrl}/logged-out/${driverId}`,
      {},
      { responseType: 'text' }
    ).pipe(
      catchError(error => {
        console.error('Error logging out driver on backend:', error);
        return throwError(() => new Error('Failed to log out driver on backend. ' + (error.error || error.message)));
      })
    );
  }

  setDriverUnavailable(driverId: number): Observable<any> {
    return this.http.post(`${this.driverApiUrl}/set-unavailable/${driverId}`, {});
  }

}
