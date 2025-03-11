import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private apiUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

  constructor(private http: HttpClient) { }

  getAddressSuggestions(query: string): Observable<any> {
    const params = new HttpParams()
      .set('input', query)
      .set('key', 'AIzaSyBpcKYv1TzF58SQ6DOEXcMhirtxx530dzI');

    return this.http.get<any>(this.apiUrl, { params });
  }
}
