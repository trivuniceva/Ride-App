import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Point} from '../../models/point.model';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiUrl = 'http://localhost:8080/routes';

  constructor(private http: HttpClient) { }

  getRoutePoints(routeId: number): Observable<Point[]> {
    return this.http.get<Point[]>(`${this.apiUrl}/${routeId}/points`);
  }
}
