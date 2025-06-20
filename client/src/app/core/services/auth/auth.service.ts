// src/app/core/services/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, catchError, Observable, throwError, of, tap } from "rxjs";
import {User} from '../../models/user.model'; // Dodaj 'tap' operator

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';

  // BehaviorSubject za praćenje prijavljenog korisnika
  // Inicijalna vrednost se čita iz localStorage prilikom pokretanja servisa
  private loggedUserSubject = new BehaviorSubject<User | null>(
    JSON.parse(localStorage.getItem('loggedUser') || 'null')
  );
  // Observable koji komponente mogu da prate
  loggedUser$: Observable<User | null> = this.loggedUserSubject.asObservable();

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl + '/login', { email, password }).pipe(
      tap((response: any) => { // Koristi tap da bi se izvršila akcija sa odgovorom bez menjanja Observabla
        this.storageHandle({ user: response }); // Poziva se storageHandle sa celim odgovorom
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(error);
      })
    );
  }

  // Preimenuj i modifikuj ovu metodu
  // Sada samo vraća Observable iz BehaviorSubject-a
  getLoggedUser(): Observable<User | null> {
    return this.loggedUser$;
  }

  storageHandle({ user }: { user: User }) { // Očekuje User objekat
    localStorage.setItem('loggedUser', JSON.stringify(user));
    this.loggedUserSubject.next(user); // Ažuriraj BehaviorSubject
  }

  logout() {
    localStorage.removeItem('loggedUser');
    this.loggedUserSubject.next(null); // Postavi na null kada se korisnik odjavi
  }

  register(userData: any): Observable<any> {
    console.log(userData.email);
    console.log(userData.password);
    console.log(userData.role);

    return this.http.post<any>(`${this.apiUrl}/signup`, userData).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(error);
      })
    );
  }
}
