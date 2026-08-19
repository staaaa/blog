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
      <header class="hero">
        <h1 class="hero-title">Ulubione Gry</h1>
        <p class="hero-subtitle">Lista gier dodanych do Twojej prywatnej kolekcji ulubionych tytułów.</p>
      </header>

      <div class="results-count" *ngIf="!loading && games.length > 0">
        Zapisano {{ games.length }} {{ games.length === 1 ? 'grę' : 'gier' }}
      </div>

      <section class="games-grid" *ngIf="games.length > 0">
        <app-review-card *ngFor="let game of games" [game]="game"></app-review-card>
      </section>

      <div class="empty-state" *ngIf="games.length === 0 && !loading">
        <p>Nie masz jeszcze żadnych gier dodanych do ulubionych.</p>
        <a routerLink="/" class="btn-browse">Przeglądaj recenzje gier</a>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Ładowanie ulubionych gier...</p>
      </div>
    </div>
  `,
  styles: [`
    .favorites-container {
      max-width: 1160px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
    }

    .hero {
      text-align: center;
      padding: 3rem 0 1.5rem;
      margin-bottom: 1.5rem;
    }

    .hero-title {
      font-size: 2.6rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--text-color);
      margin: 0 0 0.75rem;
    }

    .hero-subtitle {
      font-size: 1.05rem;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.5;
    }

    .results-count {
      text-align: right;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }

    .empty-state {
      text-align: center;
      padding: 6rem 0;
      color: var(--text-muted);
    }

    .empty-state p {
      font-size: 1.1rem;
      margin: 0 0 1.5rem;
    }

    .btn-browse {
      display: inline-block;
      padding: 0.65rem 1.5rem;
      background: var(--accent-color);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }

    .btn-browse:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 6rem 0;
      gap: 1.25rem;
      color: var(--text-muted);
    }

    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top: 3px solid var(--accent-color);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .favorites-container {
        padding: 1.5rem 1rem;
      }
      .hero-title {
        font-size: 2rem;
      }
      .games-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }
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
