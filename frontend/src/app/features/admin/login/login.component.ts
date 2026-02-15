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
          <span class="login-icon">🔐</span>
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
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: linear-gradient(145deg, #1e1e2f 0%, #252538 100%);
      border-radius: 24px;
      padding: 3rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .login-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }

    .login-header h1 {
      font-size: 1.8rem;
      color: white;
      margin: 0 0 0.5rem;
    }

    .login-header p {
      color: #a0a0c0;
      margin: 0;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #c0c0d0;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .form-group input {
      width: 100%;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: white;
      font-size: 1rem;
      outline: none;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .form-group input:focus {
      border-color: rgba(138, 43, 226, 0.5);
      box-shadow: 0 0 20px rgba(138, 43, 226, 0.15);
    }

    .form-group input::placeholder {
      color: #666680;
    }

    .error-message {
      background: rgba(220, 53, 69, 0.15);
      border: 1px solid rgba(220, 53, 69, 0.3);
      color: #ff6b7a;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      text-align: center;
    }

    .login-btn {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #8a2be2 0%, #6a1bb2 100%);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(138, 43, 226, 0.4);
    }

    .login-btn:disabled {
      opacity: 0.7;
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
