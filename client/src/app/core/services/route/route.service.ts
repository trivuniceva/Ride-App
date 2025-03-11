import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Point} from '../../models/point.model';

export interface RouteA {
  path: string[];
  distance: number;
}


@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiUrl = 'http://localhost:8080/routes';

  constructor(private http: HttpClient) { }

  getRoutePoints(routeId: number): Observable<Point[]> {
    return this.http.get<Point[]>(`${this.apiUrl}/${routeId}/points`);
  }

  getShortestRoutes(startAddress: string, destinationAddress: string): Observable<RouteA[]> {
    const url = `http://localhost:8080/routes/shortest-paths?start=${startAddress}&end=${destinationAddress}`;
    return this.http.get<RouteA[]>(url); // Očekujte listu objekata RouteA
  }


}
