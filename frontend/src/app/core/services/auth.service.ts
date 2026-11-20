import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { UserProfile, UserRole } from './api.service';

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/api/auth';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private draftKey = 'review_draft';

  private _user = signal<UserProfile | null>(this.getStoredUser());
  private _token = signal<string | null>(this.getStoredToken());

  user = this._user.asReadonly();
  isAuthenticated = computed(() => !!this._token());
  role = computed(() => this._user()?.role || null);
  isAdmin = computed(() => this._user()?.role === 'admin');
  isReviewer = computed(() => this._user()?.role === 'reviewer' || this._user()?.role === 'admin');
  isReader = computed(() => !!this._user());
  displayName = computed(() => this._user()?.displayName || this._user()?.username || 'Użytkownik');
  avatarUrl = computed(() => this._user()?.avatarUrl || null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  private getStoredUser(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return this._token();
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          this._token.set(response.token);
          this._user.set(response.user);
        })
      );
  }

  register(username: string, password: string, displayName?: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, { username, password, displayName })
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          this._token.set(response.token);
          this._user.set(response.user);
        })
      );
  }

  updateLocalUser(updatedData: Partial<UserProfile>): void {
    const current = this._user();
    if (current) {
      const merged = { ...current, ...updatedData };
      localStorage.setItem(this.userKey, JSON.stringify(merged));
      this._user.set(merged);
    }
  }

  /**
   * Clear auth state without navigating — used by the interceptor
   * when it handles the redirect itself.
   */
  clearAuthState(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this._token.set(null);
    this._user.set(null);
  }

  logout(redirectUrl = '/admin/login'): void {
    this.clearAuthState();
    this.router.navigate([redirectUrl]);
  }

  checkAuth(): Observable<UserProfile | null> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }

    return this.http.get<UserProfile>(`${this.baseUrl}/me`).pipe(
      tap(user => {
        this._user.set(user);
        localStorage.setItem(this.userKey, JSON.stringify(user));
      }),
      catchError(() => {
        this.clearAuthState();
        return of(null);
      })
    );
  }

  // --- Review draft persistence for session expiry ---

  saveReviewDraft(draft: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.draftKey, JSON.stringify({
        data: draft,
        savedAt: new Date().toISOString()
      }));
    } catch {
      // localStorage full — silently ignore
    }
  }

  getReviewDraft(): { data: any; savedAt: string } | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(this.draftKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Retrieves the draft and immediately removes it from localStorage
   * so no stale draft is left behind.
   */
  consumeReviewDraft(): any | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(this.draftKey);
    if (!raw) return null;
    try {
      localStorage.removeItem(this.draftKey);
      const parsed = JSON.parse(raw);
      return parsed.data || null;
    } catch {
      localStorage.removeItem(this.draftKey);
      return null;
    }
  }

  clearReviewDraft(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.draftKey);
  }

  hasPendingDraft(): boolean {
    return !!this.getReviewDraft();
  }
}
