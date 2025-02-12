import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/auth';

  private userRoleSubject = new BehaviorSubject<string>('');
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl + '/login', { email, password });
  }

  getLoggedUser(){
    const user = localStorage.getItem('loggedUser');
    return user ? JSON.parse(user) : null;
  }

  storageHandle({ user }: { user: any }) {
    localStorage.setItem('loggedUser', JSON.stringify(user));
    this.userRoleSubject.next(user.userRole);
  }

  logout() {
    localStorage.removeItem('loggedUser');
    this.userRoleSubject.next('');
  }



}
