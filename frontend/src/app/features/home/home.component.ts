import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Game } from '../../core/services/api.service';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReviewCardComponent],
  template: `
    <div class="home-container">
      <header class="hero">
        <h1 class="hero-title">Recenzje Gier</h1>
        <p class="hero-subtitle">Rzetelne recenzje od dwójki kuzynów.</p>
      </header>

      <div class="sort-bar">
        <label for="sortSelect">Sortuj według:</label>
        <select id="sortSelect" [(ngModel)]="currentSort" (ngModelChange)="onSortChange()">
          <option value="newest">Ostatnio recenzowane</option>
          <option value="releaseDate">Data premiery</option>
          <option value="ratingHigh">Najwyższa ocena</option>
          <option value="ratingLow">Najniższa ocena</option>
        </select>
      </div>

      <section class="games-grid" *ngIf="games.length > 0">
        <app-review-card *ngFor="let game of games" [game]="game"></app-review-card>
      </section>

      <div class="empty-state" *ngIf="games.length === 0 && !loading">
        <p>Brak recenzji do wyświetlenia.</p>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Ładowanie artykułów...</p>
      </div>

      <div class="pagination" *ngIf="pagination.totalPages > 1">
        <button
          class="page-btn"
          [disabled]="pagination.page <= 1"
          (click)="loadGames(pagination.page - 1)"
        >
          Poprzednia
        </button>
        <span class="page-info">{{ pagination.page }} / {{ pagination.totalPages }}</span>
        <button
          class="page-btn"
          [disabled]="pagination.page >= pagination.totalPages"
          (click)="loadGames(pagination.page + 1)"
        >
          Następna
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .home-container {
        max-width: 1160px;
        margin: 0 auto;
        padding: 2.5rem 1.5rem;
      }

      .hero {
        text-align: center;
        padding: 3rem 0 1.5rem;
        margin-bottom: 2rem;
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

      .sort-bar {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 2rem;
        justify-content: flex-end;
      }

      .sort-bar label {
        color: var(--text-muted);
        font-weight: 600;
        font-size: 0.85rem;
      }

      .sort-bar select {
        padding: 0.5rem 0.85rem;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-color);
        font-size: 0.85rem;
        cursor: pointer;
        outline: none;
        transition: border-color 0.2s ease;
      }

      .sort-bar select:focus {
        border-color: var(--accent-color);
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
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2rem;
        margin-top: 4rem;
      }

      .page-btn {
        padding: 0.6rem 1.2rem;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-color);
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .page-btn:hover:not(:disabled) {
        border-color: var(--accent-color);
        color: var(--accent-color);
      }

      .page-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .page-info {
        color: var(--text-muted);
        font-size: 0.9rem;
        font-weight: 600;
      }

      @media (max-width: 768px) {
        .home-container {
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
    `,
  ],
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private titleService = inject(Title);
  private meta = inject(Meta);

  games: Game[] = [];
  loading = true;
  currentSort = 'newest';
  pagination = { page: 1, totalPages: 1, total: 0, limit: 9 };

  ngOnInit(): void {
    this.titleService.setTitle('Giercujemy – Recenzje Gier');
    this.meta.updateTag({ name: 'description', content: 'Recenzje gier na Giercujemy. Sprawdź nasze oceny i opinie.' });
    this.meta.updateTag({ property: 'og:title', content: 'Giercujemy – Recenzje Gier' });
    this.meta.updateTag({ property: 'og:description', content: 'Recenzje gier na Giercujemy. Sprawdź nasze oceny i opinie.' });
    this.meta.updateTag({ property: 'og:url', content: 'https://giercujemy-staa.duckdns.org/' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.loadGames(1);
  }

  onSortChange(): void {
    this.loadGames(1);
  }

  loadGames(page: number): void {
    this.loading = true;
    this.api.getGames(page, 9, this.currentSort).subscribe({
      next: (response) => {
        this.games = response.games || [];
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading games:', err);
        this.loading = false;
      },
    });
  }
}
