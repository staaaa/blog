import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="account-container">
      <header class="account-header">
        <h1>Ustawienia konta</h1>
        <p class="subtitle">Zarządzaj swoim profilem, awatarem i danymi logowania.</p>
      </header>

      <!-- Profile Form -->
      <section class="card">
        <h2>Twój profil i podpis recenzenta</h2>
        <form (ngSubmit)="saveProfile()" class="account-form">
          <div class="avatar-edit-section">
            <div class="avatar-preview">
              <img *ngIf="avatarUrl" [src]="getImageUrl(avatarUrl)" alt="Awatar">
              <span *ngIf="!avatarUrl" class="avatar-fallback">{{ (displayName || 'U')[0].toUpperCase() }}</span>
            </div>

            <div class="avatar-controls">
              <input type="file" #avatarInput (change)="uploadAvatar($event)" accept="image/*" style="display: none">
              <button type="button" (click)="avatarInput.click()" class="btn btn-secondary">
                Zmień awatar
              </button>
              <button *ngIf="avatarUrl" type="button" (click)="removeAvatar()" class="btn btn-text-danger">
                Usuń awatar
              </button>
              <span class="avatar-hint">Formaty: JPG, PNG, WebP (maks. 5MB)</span>
            </div>
          </div>

          <div class="form-group">
            <label for="displayName">Imię i nazwisko (wyświetlany podpis) *</label>
            <input
              type="text"
              id="displayName"
              [(ngModel)]="displayName"
              name="displayName"
              required
              placeholder="np. Jan Kowalski"
            >
            <span class="field-hint">
              To imię i nazwisko będzie widoczne przy Twoich recenzjach jako podpis autora.
            </span>
          </div>

          <div class="form-group">
            <label>Rola w portalu</label>
            <input type="text" [value]="getRoleLabel()" disabled class="input-disabled">
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="savingProfile" class="btn btn-primary">
              {{ savingProfile ? 'Zapisywanie...' : 'Zapisz profil' }}
            </button>
          </div>
        </form>
      </section>

      <!-- Password Change -->
      <section class="card">
        <h2>Zmień hasło</h2>
        <form (ngSubmit)="changePassword()" class="account-form">
          <div class="form-group">
            <label for="currentPassword">Obecne hasło *</label>
            <input
              type="password"
              id="currentPassword"
              [(ngModel)]="currentPassword"
              name="currentPassword"
              required
              placeholder="Wpisz obecne hasło"
            >
          </div>

          <div class="form-group">
            <label for="newPassword">Nowe hasło *</label>
            <input
              type="password"
              id="newPassword"
              [(ngModel)]="newPassword"
              name="newPassword"
              required
              placeholder="Minimum 6 znaków"
            >
          </div>

          <div class="form-group">
            <label for="confirmPassword">Powtórz nowe hasło *</label>
            <input
              type="password"
              id="confirmPassword"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
              placeholder="Powtórz nowe hasło"
            >
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="savingPassword" class="btn btn-primary">
              {{ savingPassword ? 'Zmienianie hasła...' : 'Zmień hasło' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  `,
  styles: [`
    .account-container {
      max-width: 720px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }

    .account-header h1 {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 0.35rem;
    }

    .subtitle {
      color: var(--text-muted);
      margin: 0 0 2rem;
      font-size: 0.95rem;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 1.75rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 16px var(--shadow);
    }

    .card h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }

    .avatar-edit-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 1.75rem;
    }

    .avatar-preview {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--accent-color);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      font-weight: 800;
      border: 2px solid var(--border-color);
      flex-shrink: 0;
    }

    .avatar-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-controls {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .avatar-hint {
      font-size: 0.78rem;
      color: var(--text-muted);
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

    input[type="text"],
    input[type="password"] {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--input-bg);
      color: var(--text-primary);
      font-size: 0.95rem;
      font-family: inherit;
    }

    input:focus {
      outline: none;
      border-color: var(--accent-color);
    }

    .input-disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: var(--bg-color);
    }

    .field-hint {
      display: block;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 0.35rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .btn-primary {
      background: var(--accent-color);
      color: #ffffff;
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: var(--bg-color);
      border-color: var(--border-color);
      color: var(--text-primary);
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }

    .btn-secondary:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
    }

    .btn-text-danger {
      background: transparent;
      border: none;
      color: #ef4444;
      font-size: 0.8rem;
      padding: 0;
      cursor: pointer;
    }

    .btn-text-danger:hover {
      text-decoration: underline;
    }
  `]
})
export class AccountSettingsComponent implements OnInit {
  private api = inject(ApiService);
  public authService = inject(AuthService);

  displayName = '';
  avatarUrl: string | null = null;
  savingProfile = false;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  savingPassword = false;

  ngOnInit(): void {
    const u = this.authService.user();
    if (u) {
      this.displayName = u.displayName || u.username;
      this.avatarUrl = u.avatarUrl || null;
    }
  }

  getRoleLabel(): string {
    const role = this.authService.role();
    switch (role) {
      case 'admin': return 'Administrator (wszystkie uprawnienia)';
      case 'reviewer': return 'Recenzent (tworzenie recenzji i gier)';
      case 'reader': return 'Czytelnik (zapisywanie do ulubionych)';
      default: return 'Użytkownik';
    }
  }

  uploadAvatar(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.api.uploadImage(file).subscribe({
        next: (res) => {
          this.avatarUrl = res.url;
        },
        error: (err) => alert('Błąd przesyłania awatara: ' + (err.error?.error || err.message))
      });
    }
  }

  removeAvatar(): void {
    this.avatarUrl = null;
  }

  saveProfile(): void {
    if (!this.displayName.trim()) {
      alert('Imię i nazwisko jest wymagane');
      return;
    }

    this.savingProfile = true;
    this.api.updateProfile({
      displayName: this.displayName.trim(),
      avatarUrl: this.avatarUrl || ''
    }).subscribe({
      next: (updated) => {
        this.savingProfile = false;
        this.authService.updateLocalUser(updated);
        alert('Profil został pomyślnie zaktualizowany!');
      },
      error: (err) => {
        this.savingProfile = false;
        alert('Błąd aktualizacji profilu: ' + (err.error?.error || err.message));
      }
    });
  }

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword) {
      alert('Wypełnij wszystkie pola hasła');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('Nowe hasła nie są identyczne');
      return;
    }

    if (this.newPassword.length < 6) {
      alert('Nowe hasło musi mieć co najmniej 6 znaków');
      return;
    }

    this.savingPassword = true;
    this.api.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.savingPassword = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        alert('Hasło zostało zmienione pomyślnie!');
      },
      error: (err) => {
        this.savingPassword = false;
        alert('Błąd zmiany hasła: ' + (err.error?.error || err.message));
      }
    });
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return url;
    return '/uploads/' + url;
  }
}
