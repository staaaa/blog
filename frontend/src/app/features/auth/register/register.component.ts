import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-icon">🎮</div>
          <h1>Dołącz do czytelników</h1>
          <p class="auth-subtitle">Zarejestruj konto, aby zapisywać ulubione gry i oznaczać przeczytane recenzje.</p>
        </div>

        <form (ngSubmit)="register()" class="auth-form">
          <div class="form-group">
            <label for="username">Nazwa użytkownika (login) *</label>
            <input
              type="text"
              id="username"
              [(ngModel)]="username"
              name="username"
              required
              autocomplete="username"
              placeholder="np. gracz123"
            >
          </div>

          <div class="form-group">
            <label for="displayName">Imię / Pseudonim</label>
            <input
              type="text"
              id="displayName"
              [(ngModel)]="displayName"
              name="displayName"
              placeholder="np. Piotr Nowak (opcjonalnie)"
            >
          </div>

          <div class="form-group">
            <label for="password">Hasło *</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              required
              autocomplete="new-password"
              placeholder="Minimum 6 znaków"
            >
          </div>

          <div class="form-group">
            <label for="confirmPassword">Powtórz hasło *</label>
            <input
              type="password"
              id="confirmPassword"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
              autocomplete="new-password"
              placeholder="Powtórz hasło"
            >
          </div>

          <div class="error-message" *ngIf="error">
            {{ error }}
          </div>

          <button type="submit" [disabled]="loading" class="btn-submit">
            {{ loading ? 'Tworzenie konta...' : 'Zarejestruj się' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Masz już konto? <a routerLink="/admin/login">Zaloguj się</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.5rem;
    }

    .auth-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 8px 32px var(--shadow);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .auth-header h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 0.5rem;
    }

    .auth-subtitle {
      color: var(--text-muted);
      font-size: 0.88rem;
      margin: 0;
      line-height: 1.4;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      font-size: 0.88rem;
      margin-bottom: 0.45rem;
      color: var(--text-primary);
    }

    input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--input-bg);
      color: var(--text-primary);
      font-size: 0.95rem;
      font-family: inherit;
      transition: border-color 0.2s ease;
    }

    input:focus {
      outline: none;
      border-color: var(--accent-color);
    }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
      text-align: center;
    }

    .btn-submit {
      width: 100%;
      padding: 0.85rem;
      background: var(--accent-color);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-submit:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-2px);
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-color);
      font-size: 0.88rem;
      color: var(--text-muted);
    }

    .auth-footer a {
      color: var(--accent-color);
      text-decoration: none;
      font-weight: 600;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  displayName = '';
  password = '';
  confirmPassword = '';
  error = '';
  loading = false;

  register(): void {
    if (!this.username.trim() || !this.password) {
      this.error = 'Wypełnij wszystkie wymagane pola.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Hasła nie są identyczne.';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Hasło musi mieć co najmniej 6 znaków.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(
      this.username.trim(),
      this.password,
      this.displayName.trim() || undefined
    ).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Wystąpił błąd podczas rejestracji.';
      }
    });
  }
}
