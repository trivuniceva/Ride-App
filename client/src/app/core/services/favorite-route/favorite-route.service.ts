import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { PointDTO } from '../../models/PointDTO.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FavoriteRoute {
  id?: string;
  userEmail: string;
  startAddress: string;
  stops: string[];
  destinationAddress: string;
  startLocation: PointDTO | null;
  stopLocations: PointDTO[];
  destinationLocation: PointDTO | null;
  vehicleType: string | null;
  carriesBabies: boolean;
  carriesPets: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteRouteService {
  private apiUrl = 'http://localhost:8080/api/favorite-routes';

  constructor(private http: HttpClient) { }

  addFavoriteRoute(routeData: any, additionalOptions: { carriesBabies: boolean; carriesPets: boolean }, userEmail: string): Observable<FavoriteRoute> {
    const favoriteRoute: FavoriteRoute = {
      userEmail: userEmail,
      startAddress: routeData.startAddress,
      stops: routeData.stops,
      destinationAddress: routeData.destinationAddress,
      startLocation: routeData.startLocation,
      stopLocations: routeData.stopLocations,
      destinationLocation: routeData.destinationLocation,
      vehicleType: routeData.vehicleType,
      carriesBabies: additionalOptions.carriesBabies,
      carriesPets: additionalOptions.carriesPets,
    };

    console.log('Sending favorite route to backend:', favoriteRoute);
    return this.http.post<FavoriteRoute>(this.apiUrl, favoriteRoute).pipe(
      tap(response => console.log('Backend add favorite route response:', response))
    );
  }

  getFavoriteRoutes(userEmail: string): Observable<FavoriteRoute[]> {
    console.log(`Requesting favorite routes for user: ${userEmail}`);
    return this.http.get<FavoriteRoute[]>(`${this.apiUrl}/user/${userEmail}`).pipe(
      tap(response => console.log('Backend get favorite routes response:', response))
    );
  }

  removeFavoriteRoute(routeId: string): Observable<any> {
    console.log(`Removing favorite route with ID: ${routeId}`);
    return this.http.delete<any>(`${this.apiUrl}/${routeId}`).pipe(
      tap(response => console.log('Backend remove favorite route response:', response))
    );
  }
}
