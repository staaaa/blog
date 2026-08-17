import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Panel Admina</h1>
          <p>Zaloguj się, aby zarządzać recenzjami</p>
        </div>

        <form (ngSubmit)="login()" class="login-form">
          <div class="form-group">
            <label for="username">Nazwa użytkownika</label>
            <input 
              type="text" 
              id="username" 
              [(ngModel)]="username" 
              name="username"
              placeholder="admin"
              required
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
            >
          </div>

          <div class="error-message" *ngIf="error">
            {{ error }}
          </div>

          <button type="submit" class="login-btn" [disabled]="loading">
            {{ loading ? 'Logowanie...' : 'Zaloguj się' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      background-color: var(--card-bg);
      border-radius: 12px;
      padding: 2.5rem;
      border: 1px solid var(--border-color);
      box-shadow: 0 8px 24px var(--shadow);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h1 {
      font-size: 1.6rem;
      font-family: var(--font-serif);
      font-weight: 300;
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
      margin-bottom: 0.4rem;
      color: var(--text-color);
      font-weight: 500;
      font-size: 0.85rem;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--input-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-color);
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }

    .form-group input:focus {
      border-color: var(--accent-color);
    }

    .form-group input::placeholder {
      color: var(--text-muted);
    }

    .error-message {
      background: rgba(220, 53, 69, 0.1);
      border: 1px solid rgba(220, 53, 69, 0.3);
      color: #ff6b7a;
      padding: 0.6rem 1rem;
      border-radius: 6px;
      margin-bottom: 1.25rem;
      font-size: 0.85rem;
      text-align: center;
    }

    .login-btn {
      width: 100%;
      padding: 0.75rem;
      background-color: var(--accent-color);
      border: none;
      border-radius: 6px;
      color: white;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .login-btn:hover:not(:disabled) {
      background-color: var(--accent-hover);
    }

    .login-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
      next: () => {
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Błąd logowania';
        this.loading = false;
      }
    });
  }
}
