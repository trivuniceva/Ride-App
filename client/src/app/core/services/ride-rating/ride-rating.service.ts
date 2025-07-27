import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RideRatingPayload {
  rideId: number;
  reviewerUserId: number;
  driverId: number;
  vehicleId: number | null;
  driverRating: number;
  vehicleRating: number;
  comment: string;
}

@Injectable({
  providedIn: 'root'
})
export class RideRatingService {
  private apiUrl = 'http://localhost:8080/api/ratings';

  constructor(private http: HttpClient) { }

  submitRideRating(ratingData: RideRatingPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/submit`, ratingData);
  }
}
