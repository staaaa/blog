import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Review, PaginatedResponse } from '../../core/services/api.service';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReviewCardComponent],
  template: `
    <div class="home-container">
      <header class="hero">
        <h1 class="hero-title">Najnowsze <span class="highlight">Recenzje</span></h1>
        <p class="hero-subtitle">Odkryj świat gier przez pryzmat szczegółowych recenzji</p>
      </header>

      <section class="reviews-grid" *ngIf="reviews.length > 0">
        <app-review-card *ngFor="let review of reviews" [review]="review"></app-review-card>
      </section>

      <div class="empty-state" *ngIf="reviews.length === 0 && !loading">
        <span class="empty-icon">📭</span>
        <p>Brak recenzji do wyświetlenia</p>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Ładowanie recenzji...</p>
      </div>

      <div class="pagination" *ngIf="pagination.totalPages > 1">
        <button 
          class="page-btn" 
          [disabled]="pagination.page <= 1" 
          (click)="loadReviews(pagination.page - 1)"
        >
          ← Poprzednia
        </button>
        <span class="page-info">{{ pagination.page }} z {{ pagination.totalPages }}</span>
        <button 
          class="page-btn" 
          [disabled]="pagination.page >= pagination.totalPages" 
          (click)="loadReviews(pagination.page + 1)"
        >
          Następna →
        </button>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .hero {
      text-align: center;
      padding: 3rem 0;
      margin-bottom: 2rem;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 800;
      color: white;
      margin: 0 0 1rem;
    }

    .hero-title .highlight {
      background: linear-gradient(135deg, #8a2be2 0%, #00d4aa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.2rem;
      color: #a0a0c0;
      margin: 0;
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
      flex-direction: column;
      align-items: center;
      padding: 4rem;
      gap: 1rem;
      color: #a0a0c0;
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

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      margin-top: 3rem;
    }

    .page-btn {
      padding: 0.8rem 1.5rem;
      background: rgba(138, 43, 226, 0.2);
      border: 1px solid rgba(138, 43, 226, 0.3);
      border-radius: 10px;
      color: #b47cff;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .page-btn:hover:not(:disabled) {
      background: rgba(138, 43, 226, 0.3);
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      color: #a0a0c0;
      font-weight: 500;
    }
  `]
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  
  reviews: Review[] = [];
  loading = true;
  pagination = { page: 1, totalPages: 1, total: 0, limit: 12 };

  ngOnInit(): void {
    this.loadReviews(1);
  }

  loadReviews(page: number): void {
    this.loading = true;
    this.api.getReviews(page, 12).subscribe({
      next: (response) => {
        this.reviews = response.reviews;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.loading = false;
      }
    });
  }
}
