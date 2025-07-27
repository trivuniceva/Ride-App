import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Driver } from '../../models/driver.model';
import {Ride} from '../../models/ride.model';

interface PointDTO {
  latitude: number;
  longitude: number;
  id?: number;
}

interface RideRequestDTO {
  startAddress: string;
  stops: string[];
  destinationAddress: string;
  startLocation: PointDTO | null;
  stopLocations: PointDTO[];
  destinationLocation: PointDTO | null;
  vehicleType: string | null;
  carriesBabies: boolean;
  carriesPets: boolean;
  passengers: string[];
  paymentStatus: string | null;
  fullPrice: number;
  requestorEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private apiUrl = 'http://localhost:8080/rides';

  constructor(private http: HttpClient) { }

  getActiveRides(): Observable<Driver[]> {
    return this.http.get<Driver[]>(this.apiUrl + '/active');
  }

  createRide(
    routeData: {
      startAddress: string;
      stops: string[];
      destinationAddress: string;
      startLocation: PointDTO | null;
      stopLocations: PointDTO[];
      destinationLocation: PointDTO | null;
      vehicleType: string | null;
    },
    additionalOptions: { carriesBabies: boolean; carriesPets: boolean },
    passengers: string[],
    fullPrice: number,
    paymentStatus: string,
    requestorEmail: string
  ): Observable<any> {

    const rideRequest: RideRequestDTO = {
      startAddress: routeData.startAddress,
      stops: routeData.stops,
      destinationAddress: routeData.destinationAddress,
      startLocation: routeData.startLocation,
      stopLocations: routeData.stopLocations,
      destinationLocation: routeData.destinationLocation,
      vehicleType: routeData.vehicleType,
      carriesBabies: additionalOptions.carriesBabies,
      carriesPets: additionalOptions.carriesPets,
      passengers: passengers,
      paymentStatus: paymentStatus,
      fullPrice: fullPrice,
      requestorEmail: requestorEmail
    };

    console.log("RideService: Sending Ride Request DTO to backend:", rideRequest);

    return this.http.post<any>(this.apiUrl, rideRequest);
  }

  getRideHistory(userId: number, userRole: string, userEmail: string | null): Observable<Ride[]> {
    let params = new HttpParams();
    if (userEmail) {
      params = params.set('userEmail', userEmail);
    }
    return this.http.get<Ride[]>(`${this.apiUrl}/history/${userId}/${userRole}`, { params });
  }

}
