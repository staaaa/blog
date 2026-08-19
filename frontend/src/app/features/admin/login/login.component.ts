import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Logowanie do portalu</h1>
          <p>Zaloguj się na swoje konto recenzenta lub czytelnika</p>
        </div>

        <form (ngSubmit)="login()" class="login-form">
          <div class="form-group">
            <label for="username">Nazwa użytkownika</label>
            <input 
              type="text" 
              id="username" 
              [(ngModel)]="username" 
              name="username"
              placeholder="Twój login"
              required
              autocomplete="username"
            >
          </div>

          <div class="form-group">
            <label for="password">Hasło</label>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="password" 
              name="password"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            >
          </div>

          <div class="error-message" *ngIf="error">
            {{ error }}
          </div>

          <button type="submit" class="login-btn" [disabled]="loading">
            {{ loading ? 'Logowanie...' : 'Zaloguj się' }}
          </button>
        </form>

        <div class="login-footer">
          <p>Nie masz jeszcze konta? <a routerLink="/register">Zarejestruj się jako czytelnik</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.5rem;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background-color: var(--card-bg);
      border-radius: 16px;
      padding: 2.5rem;
      border: 1px solid var(--border-color);
      box-shadow: 0 8px 32px var(--shadow);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h1 {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--text-color);
      margin: 0 0 0.5rem;
    }

    .login-header p {
      color: var(--text-muted);
      margin: 0;
      font-size: 0.9rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.45rem;
      color: var(--text-color);
      font-weight: 600;
      font-size: 0.88rem;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--input-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-color);
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
      font-family: inherit;
    }

    .form-group input:focus {
      border-color: var(--accent-color);
    }

    .error-message {
      background: rgba(220, 53, 69, 0.1);
      border: 1px solid rgba(220, 53, 69, 0.3);
      color: #ff6b7a;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.25rem;
      font-size: 0.85rem;
      text-align: center;
    }

    .login-btn {
      width: 100%;
      padding: 0.85rem;
      background-color: var(--accent-color);
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .login-btn:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-2px);
    }

    .login-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .login-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-color);
      font-size: 0.88rem;
      color: var(--text-muted);
    }

    .login-footer a {
      color: var(--accent-color);
      text-decoration: none;
      font-weight: 600;
    }

    .login-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  error = '';
  loading = false;

  login(): void {
    if (!this.username || !this.password) {
      this.error = 'Wypełnij wszystkie pola';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        if (res.user.role === 'admin' || res.user.role === 'reviewer') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.error = err.error?.error || 'Błąd logowania';
        this.loading = false;
      }
    });
  }
}
