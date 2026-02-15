import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';

interface User {
  id: number;
  username: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/api/auth';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  private _user = signal<User | null>(this.getStoredUser());
  private _token = signal<string | null>(this.getStoredToken());

  user = this._user.asReadonly();
  isAuthenticated = computed(() => !!this._token());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  private getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return this._token();
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          this._token.set(response.token);
          this._user.set(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/admin/login']);
  }

  checkAuth(): Observable<User | null> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }

    return this.http.get<User>(`${this.baseUrl}/me`).pipe(
      tap(user => this._user.set(user)),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }
}
