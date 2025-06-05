import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SplitFareService {
  private apiUrl = 'http://localhost:8080/api/split-fare';

  constructor(private http: HttpClient) {}

  sendPassengerEmails(emails: string[]): Observable<any> {
    return this.http.post(this.apiUrl, { emails });
  }
}
