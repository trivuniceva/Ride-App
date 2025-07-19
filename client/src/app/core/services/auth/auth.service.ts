import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, catchError, Observable, throwError, of, tap } from "rxjs";
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';

  private loggedUserSubject = new BehaviorSubject<User | null>(
    JSON.parse(localStorage.getItem('loggedUser') || 'null')
  );
  loggedUser$: Observable<User | null> = this.loggedUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl + '/login', { email, password }).pipe(
      tap((response: any) => {
        const user: User = response; // Pretpostavljamo da backend vraća User objekat
        this.storageHandle({ user: user });

        if (user && user.userRole === 'DRIVER') {
          console.log('User is a DRIVER. Calling loggedDriver backend method.');
          this.userService.loggedDriver(user.id).subscribe({
            next: (driverResponse) => {
              console.log('Driver logged in successfully on backend:', driverResponse);
            },
            error: (err) => {
              console.error('Error calling loggedDriver backend method:', err);
            }
          });
        }

        this.router.navigate(['/user-profile']);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(error);
      })
    );
  }

  getLoggedUser(): Observable<User | null> {
    return this.loggedUser$;
  }

  storageHandle({ user }: { user: User }) {
    localStorage.setItem('loggedUser', JSON.stringify(user));
    this.loggedUserSubject.next(user);
  }

  logout() {
    const loggedUser = this.loggedUserSubject.getValue();

    if (loggedUser && loggedUser.userRole === 'DRIVER') {
      console.log('User is a DRIVER. Notifying backend about logout.');
      this.userService.loggedOutDriver(loggedUser.id).subscribe({
        next: (response) => {
          console.log('Driver logout successfully recorded on backend:', response);
        },
        error: (err) => {
          console.error('Error notifying backend about driver logout:', err);
        }
      });
    }

    localStorage.removeItem('loggedUser');
    this.loggedUserSubject.next(null);
    this.router.navigate(['/login']);
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
