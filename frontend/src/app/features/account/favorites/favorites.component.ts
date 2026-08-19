import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Game } from '../../../core/services/api.service';
import { ReviewCardComponent } from '../../../shared/components/review-card/review-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, ReviewCardComponent],
  template: `
    <div class="favorites-container">
      <header class="page-header">
        <h1>❤️ Twoje ulubione gry</h1>
        <p class="subtitle">Zapisane gry, do których chcesz wrócić lub śledzić nowe recenzje.</p>
      </header>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Ładowanie ulubionych...</p>
      </div>

      <div *ngIf="!loading && games.length === 0" class="empty-state">
        <div class="empty-icon">🎮</div>
        <h2>Brak ulubionych gier</h2>
        <p>Nie dodałeś jeszcze żadnej gry do ulubionych. Przeglądaj recenzje i kliknij serduszko przy tytule gry!</p>
        <a routerLink="/" class="btn-home">Przeglądaj recenzje</a>
      </div>

      <div class="games-grid" *ngIf="!loading && games.length > 0">
        <app-review-card *ngFor="let game of games" [game]="game"></app-review-card>
      </div>
    </div>
  `,
  styles: [`
    .favorites-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }

    .page-header h1 {
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

    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.75rem;
    }

    .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      background: var(--card-bg);
      border-radius: 16px;
      border: 1px dashed var(--border-color);
      max-width: 600px;
      margin: 0 auto;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h2 {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.5rem;
    }

    .empty-state p {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin: 0 0 1.5rem;
    }

    .btn-home {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: var(--accent-color);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      transition: all 0.2s ease;
    }

    .btn-home:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }

    .loading {
      text-align: center;
      padding: 4rem;
      color: var(--text-muted);
    }

    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top: 3px solid var(--accent-color);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class FavoritesComponent implements OnInit {
  private api = inject(ApiService);

  games: Game[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.api.getFavorites().subscribe({
      next: (res) => {
        this.games = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        this.loading = false;
      }
    });
  }
}
