import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService, Category, Review } from '../../core/services/api.service';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';

@Component({
  selector: 'app-genres',
  standalone: true,
  imports: [CommonModule, RouterLink, ReviewCardComponent],
  template: `
    <div class="page-container">
      <!-- Genres List View -->
      <ng-container *ngIf="!selectedGenre">
        <header class="page-header">
          <h1>🏷️ <span class="highlight">Gatunki</span> Gier</h1>
          <p>Przeglądaj recenzje według gatunku</p>
        </header>

        <div class="categories-grid">
          <a *ngFor="let genre of genres" 
             [routerLink]="['/genres', genre.slug]" 
             class="category-card">
            <span class="category-name">{{ genre.name }}</span>
            <span class="category-arrow">→</span>
          </a>
        </div>

        <div class="empty-state" *ngIf="genres.length === 0 && !loading">
          <span class="empty-icon">📭</span>
          <p>Brak gatunków do wyświetlenia</p>
        </div>
      </ng-container>

      <!-- Single Genre View -->
      <ng-container *ngIf="selectedGenre">
        <header class="page-header">
          <a routerLink="/genres" class="back-link">← Wszystkie gatunki</a>
          <h1>🏷️ <span class="highlight">{{ selectedGenre.name }}</span></h1>
          <p>Recenzje gier z gatunku {{ selectedGenre.name }}</p>
        </header>

        <div class="reviews-grid" *ngIf="reviews.length > 0">
          <app-review-card *ngFor="let review of reviews" [review]="review"></app-review-card>
        </div>

        <div class="empty-state" *ngIf="reviews.length === 0 && !loading">
          <span class="empty-icon">📭</span>
          <p>Brak recenzji w tym gatunku</p>
        </div>
      </ng-container>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: white;
      margin: 0 0 0.5rem;
    }

    .page-header .highlight {
      background: linear-gradient(135deg, #8a2be2 0%, #00d4aa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-header p {
      color: #a0a0c0;
      font-size: 1.1rem;
      margin: 0;
    }

    .back-link {
      display: inline-block;
      margin-bottom: 1rem;
      color: #b47cff;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: #d4a5ff;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .category-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      background: linear-gradient(145deg, #1e1e2f 0%, #252538 100%);
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      text-decoration: none;
      color: white;
      transition: all 0.3s ease;
    }

    .category-card:hover {
      transform: translateY(-4px);
      border-color: rgba(138, 43, 226, 0.3);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .category-name {
      font-size: 1.2rem;
      font-weight: 600;
    }

    .category-arrow {
      font-size: 1.5rem;
      color: #8a2be2;
      transition: transform 0.2s;
    }

    .category-card:hover .category-arrow {
      transform: translateX(5px);
    }

    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem;
      color: #666680;
    }

    .empty-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(138, 43, 226, 0.2);
      border-top-color: #8a2be2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class GenresComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  genres: Category[] = [];
  selectedGenre: Category | null = null;
  reviews: Review[] = [];
  loading = true;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['slug']) {
        this.loadGenreReviews(params['slug']);
      } else {
        this.loadGenres();
      }
    });
  }

  loadGenres(): void {
    this.loading = true;
    this.selectedGenre = null;
    this.api.getGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadGenreReviews(slug: string): void {
    this.loading = true;
    this.api.getGenreReviews(slug).subscribe({
      next: (data) => {
        this.selectedGenre = data.genre || null;
        this.reviews = data.reviews;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
