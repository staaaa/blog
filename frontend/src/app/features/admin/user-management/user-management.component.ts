import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, UserProfile, UserRole } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="users-container">
      <header class="page-header">
        <div>
          <a routerLink="/admin" class="back-link">← Wróć do panelu</a>
          <h1>Zarządzanie użytkownikami</h1>
          <p class="subtitle">Twórz konta recenzentów, zarządzaj rolami i uprawnieniami.</p>
        </div>
      </header>

      <!-- Create New User Box (e.g. create reviewer directly) -->
      <section class="card form-card">
        <h2>+ Dodaj nowego recenzenta / użytkownika</h2>
        <form (ngSubmit)="createUser()" class="create-user-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Nazwa użytkownika (login) *</label>
              <input type="text" [(ngModel)]="newUsername" name="newUsername" required placeholder="np. jankowalski">
            </div>

            <div class="form-group">
              <label>Hasło początkowe *</label>
              <input type="password" [(ngModel)]="newPassword" name="newPassword" required placeholder="Minimum 6 znaków">
            </div>

            <div class="form-group">
              <label>Imię i nazwisko (podpis) *</label>
              <input type="text" [(ngModel)]="newDisplayName" name="newDisplayName" required placeholder="np. Jan Kowalski">
            </div>

            <div class="form-group">
              <label>Rola *</label>
              <select [(ngModel)]="newRole" name="newRole">
                <option value="reviewer">Recenzent (może dodawać recenzje i gry)</option>
                <option value="reader">Czytelnik (może zapisywać ulubione)</option>
                <option value="admin">Administrator (pełne uprawnienia)</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="creating" class="btn-submit">
              {{ creating ? 'Tworzenie...' : 'Utwórz konto' }}
            </button>
          </div>
        </form>
      </section>

      <!-- Users List -->
      <section class="card list-card">
        <h2>Lista użytkowników ({{ users.length }})</h2>

        <div *ngIf="loading" class="loading">
          <div class="spinner"></div>
          <p>Ładowanie użytkowników...</p>
        </div>

        <div class="table-container" *ngIf="!loading">
          <table class="users-table">
            <thead>
              <tr>
                <th>Użytkownik</th>
                <th>Imię i nazwisko</th>
                <th>Rola</th>
                <th>Data rejestracji</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td class="user-cell">
                  <div class="avatar-mini">
                    <img *ngIf="u.avatarUrl" [src]="getImageUrl(u.avatarUrl)" [alt]="u.username">
                    <span *ngIf="!u.avatarUrl">{{ (u.displayName || u.username)[0].toUpperCase() }}</span>
                  </div>
                  <strong>{{ u.username }}</strong>
                </td>
                <td>{{ u.displayName || '-' }}</td>
                <td>
                  <select [ngModel]="u.role" (ngModelChange)="changeRole(u, $event)" [disabled]="u.id === authService.user()?.id" class="role-select">
                    <option value="admin">Administrator</option>
                    <option value="reviewer">Recenzent</option>
                    <option value="reader">Czytelnik</option>
                  </select>
                </td>
                <td class="date-cell">{{ u.createdAt | date:'dd.MM.yyyy' }}</td>
                <td>
                  <button
                    *ngIf="u.id !== authService.user()?.id"
                    (click)="deleteUser(u)"
                    class="btn-delete"
                    title="Usuń użytkownika"
                  >
                    Usuń
                  </button>
                  <span *ngIf="u.id === authService.user()?.id" class="text-muted">Twoje konto</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .users-container {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }

    .back-link {
      display: inline-block;
      margin-bottom: 0.5rem;
      color: var(--accent-color);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.88rem;
    }

    .page-header h1 {
      font-size: 2rem;
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
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      font-size: 0.85rem;
      margin-bottom: 0.4rem;
      color: var(--text-primary);
    }

    input, select {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--input-bg);
      color: var(--text-primary);
      font-size: 0.9rem;
      font-family: inherit;
    }

    input:focus, select:focus {
      outline: none;
      border-color: var(--accent-color);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1.25rem;
    }

    .btn-submit {
      padding: 0.7rem 1.5rem;
      background: var(--accent-color);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-submit:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .table-container {
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .users-table th, .users-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--border-color);
      font-size: 0.88rem;
    }

    .users-table th {
      background: var(--bg-color);
      color: var(--text-muted);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .avatar-mini {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--accent-color);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.75rem;
    }

    .avatar-mini img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .role-select {
      padding: 0.35rem 0.6rem;
      font-size: 0.82rem;
      border-radius: 6px;
    }

    .btn-delete {
      padding: 0.35rem 0.65rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-delete:hover {
      background: #ef4444;
      color: #ffffff;
    }

    .text-muted {
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
    }

    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top: 3px solid var(--accent-color);
      border-radius: 50%;
      width: 28px;
      height: 28px;
      animation: spin 1s linear infinite;
      margin: 0 auto 0.5rem;
    }

    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  private api = inject(ApiService);
  public authService = inject(AuthService);

  users: UserProfile[] = [];
  loading = true;
  creating = false;

  newUsername = '';
  newPassword = '';
  newDisplayName = '';
  newRole: UserRole = 'reviewer';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.api.getUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.loading = false;
      },
      error: (err) => {
        alert('Błąd pobierania użytkowników: ' + (err.error?.error || err.message));
        this.loading = false;
      }
    });
  }

  createUser(): void {
    if (!this.newUsername.trim() || !this.newPassword.trim()) {
      alert('Nazwa użytkownika i hasło są wymagane.');
      return;
    }

    this.creating = true;
    this.api.createUser({
      username: this.newUsername.trim(),
      password: this.newPassword.trim(),
      displayName: this.newDisplayName.trim() || this.newUsername.trim(),
      role: this.newRole
    }).subscribe({
      next: (user) => {
        this.creating = false;
        this.users.push(user);
        this.newUsername = '';
        this.newPassword = '';
        this.newDisplayName = '';
        alert('Użytkownik został utworzony!');
      },
      error: (err) => {
        this.creating = false;
        alert('Błąd tworzenia użytkownika: ' + (err.error?.error || err.message));
      }
    });
  }

  changeRole(user: UserProfile, newRole: UserRole): void {
    if (user.role === newRole) return;
    this.api.updateUserRole(user.id, newRole).subscribe({
      next: (updated) => {
        user.role = updated.role;
      },
      error: (err) => {
        alert('Błąd zmiany roli: ' + (err.error?.error || err.message));
        this.loadUsers();
      }
    });
  }

  deleteUser(user: UserProfile): void {
    if (confirm(`Czy na pewno chcesz usunąć użytkownika "${user.username}"?`)) {
      this.api.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
        },
        error: (err) => alert('Błąd usuwania użytkownika: ' + (err.error?.error || err.message))
      });
    }
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return url;
    return '/uploads/' + url;
  }
}
