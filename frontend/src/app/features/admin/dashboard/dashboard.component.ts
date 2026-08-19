import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Game, Review } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-left">
          <h1>Panel recenzenta i zarządzania</h1>
          <p class="role-badge-text">
            Zalogowany jako: <strong>{{ authService.displayName() }}</strong>
            <span class="badge" [class.badge-admin]="authService.isAdmin()">
              {{ authService.isAdmin() ? 'Administrator' : 'Recenzent' }}
            </span>
          </p>
        </div>

        <div class="header-actions">
          <!-- Add Game -->
          <a routerLink="/admin/game/new" class="btn btn-secondary">
            + Dodaj nową grę
          </a>

          <!-- Add Review -->
          <a routerLink="/admin/review/new" class="btn btn-primary">
            + Napisz recenzję
          </a>

          <!-- User Management (Admin Only) -->
          <a *ngIf="authService.isAdmin()" routerLink="/admin/users" class="btn btn-admin">
            👥 Użytkownicy
          </a>

          <!-- Cleanup Images (Admin Only) -->
          <button *ngIf="authService.isAdmin()" (click)="cleanupImages()" [disabled]="cleaning" class="btn btn-outline">
            {{ cleaning ? 'Czyszczenie...' : '🧹 Usuń nieużywane zdjęcia' }}
          </button>
        </div>
      </header>

      <!-- Tabs -->
      <div class="dashboard-tabs">
        <button
          type="button"
          class="tab-btn"
          [class.active]="activeTab === 'reviews'"
          (click)="activeTab = 'reviews'"
        >
          {{ authService.isAdmin() ? 'Wszystkie recenzje' : 'Moje recenzje' }} ({{ reviews.length }})
        </button>

        <button
          type="button"
          class="tab-btn"
          [class.active]="activeTab === 'games'"
          (click)="activeTab = 'games'"
        >
          Baza gier ({{ games.length }})
        </button>
      </div>

      <!-- Reviews Tab -->
      <section *ngIf="activeTab === 'reviews'" class="tab-content">
        <div *ngIf="loadingReviews" class="loading">
          <div class="spinner"></div>
          <p>Ładowanie recenzji...</p>
        </div>

        <div *ngIf="!loadingReviews && reviews.length === 0" class="empty-state">
          <p>Nie masz jeszcze żadnych napisanych recenzji.</p>
          <a routerLink="/admin/review/new" class="btn btn-primary">Napisz pierwszą recenzję</a>
        </div>

        <div class="table-container" *ngIf="!loadingReviews && reviews.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>Gra</th>
                <th>Tytuł recenzji</th>
                <th *ngIf="authService.isAdmin()">Autor</th>
                <th>Ocena</th>
                <th>Status</th>
                <th>Data</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rev of reviews">
                <td class="game-col">
                  <strong>{{ rev.game?.gameTitle || rev.gameTitle || 'Brak tytułu gry' }}</strong>
                </td>
                <td class="title-col">
                  <a *ngIf="rev.game?.slug" [routerLink]="['/game', rev.game?.slug]" [queryParams]="{ reviewer: rev.userId }" class="review-link">
                    {{ rev.title }}
                  </a>
                  <span *ngIf="!rev.game?.slug">{{ rev.title }}</span>
                  <span *ngIf="rev.isDraft" class="draft-badge">Szkic</span>
                </td>
                <td *ngIf="authService.isAdmin()">
                  {{ rev.author?.displayName || rev.author?.username || 'Anonim' }}
                </td>
                <td>
                  <span class="rating-pill">★ {{ rev.averageRating.toFixed(1) }}</span>
                </td>
                <td>
                  <span class="status-pill">{{ getStatusLabel(rev.gameStatus) }}</span>
                </td>
                <td class="date-col">{{ rev.updatedAt | date:'dd.MM.yyyy' }}</td>
                <td class="actions-col">
                  <a [routerLink]="['/admin/review', rev.id, 'edit']" class="action-btn edit-btn" title="Edytuj">
                    Edytuj
                  </a>
                  <button (click)="deleteReview(rev.id)" class="action-btn delete-btn" title="Usuń">
                    Usuń
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Games Tab -->
      <section *ngIf="activeTab === 'games'" class="tab-content">
        <div *ngIf="loadingGames" class="loading">
          <div class="spinner"></div>
          <p>Ładowanie listy gier...</p>
        </div>

        <div *ngIf="!loadingGames && games.length === 0" class="empty-state">
          <p>Brak gier w bazie.</p>
          <a routerLink="/admin/game/new" class="btn btn-secondary">Dodaj pierwszą grę</a>
        </div>

        <div class="table-container" *ngIf="!loadingGames && games.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tytuł gry</th>
                <th>Gatunki</th>
                <th>Średnia</th>
                <th>Liczba recenzji</th>
                <th>Premiera</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let g of games">
                <td class="game-col">
                  <a [routerLink]="['/game', g.slug]" class="review-link">
                    {{ g.gameTitle }}
                  </a>
                </td>
                <td>
                  <span *ngFor="let gn of (g.genres || []).slice(0, 2)" class="mini-tag">{{ gn.name }}</span>
                </td>
                <td>
                  <span class="rating-pill" *ngIf="g.averageRating > 0">★ {{ g.averageRating.toFixed(1) }}</span>
                  <span *ngIf="!g.averageRating || g.averageRating === 0" class="text-muted">-</span>
                </td>
                <td>
                  <span class="count-pill">{{ g.reviewCount || 0 }} recenzji</span>
                </td>
                <td class="date-col">{{ g.releaseDate ? (g.releaseDate | date:'dd.MM.yyyy') : '-' }}</td>
                <td class="actions-col">
                  <!-- Review this game button -->
                  <a
                    *ngIf="!hasUserReviewedGame(g)"
                    [routerLink]="['/admin/review/new', g.id]"
                    class="action-btn write-btn"
                    title="Napisz recenzję dla tej gry"
                  >
                    + Recenzja
                  </a>
                  <!-- Edit game details -->
                  <a [routerLink]="['/admin/game', g.id, 'edit']" class="action-btn edit-btn" title="Edytuj dane gry">
                    Edytuj
                  </a>
                  <!-- Delete game (admin only) -->
                  <button *ngIf="authService.isAdmin()" (click)="deleteGame(g.id)" class="action-btn delete-btn" title="Usuń grę">
                    Usuń
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .header-left h1 {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 0.35rem 0;
    }

    .role-badge-text {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      font-size: 0.9rem;
      margin: 0;
    }

    .badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      background: rgba(255, 107, 44, 0.15);
      color: var(--accent-color);
      text-transform: uppercase;
    }

    .badge.badge-admin {
      background: rgba(139, 92, 246, 0.15);
      color: #8b5cf6;
    }

    .header-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.88rem;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .btn-primary {
      background: var(--accent-color);
      color: #ffffff;
    }

    .btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: var(--card-bg);
      border-color: var(--border-color);
      color: var(--text-primary);
    }

    .btn-secondary:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
      transform: translateY(-2px);
    }

    .btn-admin {
      background: rgba(139, 92, 246, 0.15);
      border-color: rgba(139, 92, 246, 0.4);
      color: #a78bfa;
    }

    .btn-admin:hover {
      background: #8b5cf6;
      color: #ffffff;
      transform: translateY(-2px);
    }

    .btn-outline {
      background: transparent;
      border-color: var(--border-color);
      color: var(--text-muted);
    }

    .btn-outline:hover:not(:disabled) {
      border-color: #ef4444;
      color: #ef4444;
    }

    /* Tabs */
    .dashboard-tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .tab-btn {
      padding: 0.75rem 1.5rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tab-btn:hover {
      color: var(--text-primary);
      border-color: var(--accent-color);
    }

    .tab-btn.active {
      background: rgba(255, 107, 44, 0.12);
      border-color: var(--accent-color);
      color: var(--accent-color);
    }

    .table-container {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      overflow-x: auto;
      box-shadow: 0 4px 16px var(--shadow);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .data-table th, .data-table td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
      font-size: 0.9rem;
    }

    .data-table th {
      background-color: var(--bg-color);
      color: var(--text-muted);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }

    .data-table tr:last-child td {
      border-bottom: none;
    }

    .data-table tr:hover td {
      background-color: rgba(255, 255, 255, 0.02);
    }

    .review-link {
      color: var(--text-primary);
      text-decoration: none;
      font-weight: 600;
    }

    .review-link:hover {
      color: var(--accent-color);
    }

    .draft-badge {
      font-size: 0.68rem;
      padding: 0.15rem 0.4rem;
      background: #f59e0b;
      color: #000000;
      font-weight: 700;
      border-radius: 4px;
      margin-left: 0.5rem;
      text-transform: uppercase;
    }

    .rating-pill {
      font-weight: 700;
      color: #ffb703;
    }

    .count-pill {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .mini-tag {
      display: inline-block;
      font-size: 0.72rem;
      padding: 0.1rem 0.4rem;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      margin-right: 0.25rem;
      color: var(--text-muted);
    }

    .status-pill {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .actions-col {
      white-space: nowrap;
      display: flex;
      gap: 0.45rem;
    }

    .action-btn {
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }

    .write-btn {
      background: rgba(255, 107, 44, 0.12);
      color: var(--accent-color);
      border-color: rgba(255, 107, 44, 0.3);
    }

    .write-btn:hover {
      background: var(--accent-color);
      color: #ffffff;
    }

    .edit-btn {
      background: var(--bg-color);
      border-color: var(--border-color);
      color: var(--text-primary);
    }

    .edit-btn:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
    }

    .delete-btn {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    .delete-btn:hover {
      background: #ef4444;
      color: #ffffff;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--card-bg);
      border-radius: 14px;
      border: 1px dashed var(--border-color);
      color: var(--text-muted);
    }

    .empty-state .btn {
      margin-top: 1rem;
    }

    .loading {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-muted);
    }

    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top: 3px solid var(--accent-color);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      animation: spin 1s linear infinite;
      margin: 0 auto 0.75rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  public authService = inject(AuthService);

  activeTab: 'reviews' | 'games' = 'reviews';
  reviews: Review[] = [];
  games: Game[] = [];

  loadingReviews = true;
  loadingGames = true;
  cleaning = false;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadReviews();
    this.loadGames();
  }

  loadReviews(): void {
    this.loadingReviews = true;
    this.api.getMyReviews().subscribe({
      next: (res) => {
        this.reviews = res;
        this.loadingReviews = false;
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.loadingReviews = false;
      }
    });
  }

  loadGames(): void {
    this.loadingGames = true;
    this.api.getGames(1, 100, 'title', true).subscribe({
      next: (res) => {
        this.games = res.games || [];
        this.loadingGames = false;
      },
      error: (err) => {
        console.error('Error loading games:', err);
        this.loadingGames = false;
      }
    });
  }

  hasUserReviewedGame(game: Game): boolean {
    const user = this.authService.user();
    if (!user) return false;
    return this.reviews.some(r => (r.gameId === game.id || r.game?.id === game.id) && r.userId === user.id);
  }

  deleteReview(id: number): void {
    if (confirm('Czy na pewno chcesz usunąć tę recenzję?')) {
      this.api.deleteReview(id).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== id);
          this.loadGames();
        },
        error: (err) => alert('Błąd usuwania recenzji: ' + (err.error?.error || err.message))
      });
    }
  }

  deleteGame(id: number): void {
    if (confirm('Czy na pewno chcesz usunąć tę grę i WSZYSTKIE jej recenzje?')) {
      this.api.deleteGame(id).subscribe({
        next: () => {
          this.games = this.games.filter(g => g.id !== id);
          this.loadReviews();
        },
        error: (err) => alert('Błąd usuwania gry: ' + (err.error?.error || err.message))
      });
    }
  }

  cleanupImages(): void {
    if (confirm('Czy na pewno chcesz przeskanować i usunąć nieużywane zdjęcia z serwera?')) {
      this.cleaning = true;
      this.api.cleanupUploads().subscribe({
        next: (res) => {
          this.cleaning = false;
          alert(`Czyszczenie zakończone!\nUsunięto plików: ${res.deletedCount}\nZwolniono miejsca: ${res.freedMb} MB`);
        },
        error: (err) => {
          this.cleaning = false;
          alert('Błąd podczas czyszczenia: ' + (err.error?.error || err.message));
        }
      });
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'platyna': return 'Platyna';
      case 'main_story': return 'Główny wątek';
      case 'in_progress': return 'W trakcie';
      case 'abandoned': return 'Porzucona';
      default: return 'Główny wątek';
    }
  }
}
