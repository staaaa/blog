import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Review, PaginatedResponse } from '../../core/services/api.service';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReviewCardComponent],
  template: `
    <div class="home-container">
      <header class="hero">
        <h1 class="hero-title">Najnowsze recenzje</h1>
      </header>

      <div class="sort-bar">
        <label for="sortSelect">Sortuj według:</label>
        <select id="sortSelect" [(ngModel)]="currentSort" (ngModelChange)="onSortChange()">
          <option value="newest">Ostatnio zaktualizowane</option>
          <option value="releaseDate">Data premiery</option>
          <option value="ratingHigh">Najwyższa ocena</option>
          <option value="ratingLow">Najniższa ocena</option>
        </select>
      </div>

      <section class="reviews-grid" *ngIf="reviews.length > 0">
        <app-review-card *ngFor="let review of reviews" [review]="review"></app-review-card>
      </section>

      <div class="empty-state" *ngIf="reviews.length === 0 && !loading">
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
          (click)="loadReviews(pagination.page - 1)"
        >
          Poprzednia
        </button>
        <span class="page-info">{{ pagination.page }} / {{ pagination.totalPages }}</span>
        <button
          class="page-btn"
          [disabled]="pagination.page >= pagination.totalPages"
          (click)="loadReviews(pagination.page + 1)"
        >
          Następna
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .home-container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 2.5rem 1.5rem;
      }

      .hero {
        text-align: center;
        padding: 3rem 0;
        margin-bottom: 2rem;
      }

      .hero-title {
        font-size: 2.5rem;
        font-weight: 300;
        letter-spacing: -0.75px;
        color: var(--text-color);
        margin: 0 0 0.75rem;
        font-family: var(--font-serif);
      }

      .hero-title .highlight {
        color: var(--accent-color);
      }

      .hero-subtitle {
        font-size: 1.1rem;
        color: var(--text-muted);
        max-width: 600px;
        margin: 0 auto;
      }

      .sort-bar {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 2.5rem;
        justify-content: flex-end;
      }

      .sort-bar label {
        color: var(--text-muted);
        font-weight: 500;
        font-size: 0.85rem;
      }

      .sort-bar select {
        padding: 0.5rem 0.75rem;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        color: var(--text-color);
        font-size: 0.85rem;
        cursor: pointer;
        outline: none;
        transition:
          border-color 0.2s ease,
          background-color 0.2s ease;
      }

      .sort-bar select:focus {
        border-color: var(--accent-color);
      }

      .sort-bar select option {
        background: var(--card-bg);
        color: var(--text-color);
      }

      .reviews-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2.5rem;
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
        border-radius: 6px;
        color: var(--text-color);
        font-size: 0.85rem;
        font-weight: 500;
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
        font-weight: 500;
      }

      @media (max-width: 768px) {
        .home-container {
          padding: 1.5rem 1rem;
        }
        .hero-title {
          font-size: 2rem;
        }
        .hero-subtitle {
          font-size: 1rem;
        }
        .reviews-grid {
          grid-template-columns: 1fr;
          gap: 1.75rem;
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);

  reviews: Review[] = [];
  loading = true;
  currentSort = 'newest';
  pagination = { page: 1, totalPages: 1, total: 0, limit: 9 };

  ngOnInit(): void {
    this.loadReviews(1);
  }

  onSortChange(): void {
    this.loadReviews(1);
  }

  loadReviews(page: number): void {
    this.loading = true;
    this.api.getReviews(page, 9, this.currentSort).subscribe({
      next: (response) => {
        this.reviews = response.reviews;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.loading = false;
      },
    });
  }
}
