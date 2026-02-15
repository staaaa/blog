import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Review } from '../../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>📊 Dashboard</h1>
        <a routerLink="/admin/review/new" class="new-btn">+ Nowa Recenzja</a>
      </header>

      <section class="reviews-section">
        <h2>Twoje Recenzje</h2>
        
        <div class="reviews-table" *ngIf="reviews.length > 0">
          <div class="table-header">
            <span class="col-title">Tytuł gry</span>
            <span class="col-rating">Ocena</span>
            <span class="col-date">Data</span>
            <span class="col-actions">Akcje</span>
          </div>
          
          <div class="table-row" *ngFor="let review of reviews">
            <span class="col-title">
              <a [routerLink]="['/review', review.id]">{{ review.gameTitle }}</a>
              <small>{{ review.title }}</small>
            </span>
            <span class="col-rating">
              <span class="rating-badge">{{ review.averageRating.toFixed(1) }}</span>
            </span>
            <span class="col-date">{{ review.createdAt | date:'dd.MM.yyyy' }}</span>
            <span class="col-actions">
              <a [routerLink]="['/admin/review', review.id]" class="action-btn edit">✏️</a>
              <button (click)="deleteReview(review.id)" class="action-btn delete">🗑️</button>
            </span>
          </div>
        </div>

        <div class="empty-state" *ngIf="reviews.length === 0 && !loading">
          <span class="empty-icon">📝</span>
          <p>Brak recenzji. Dodaj swoją pierwszą!</p>
          <a routerLink="/admin/review/new" class="new-btn">+ Dodaj recenzję</a>
        </div>

        <div class="loading" *ngIf="loading">
          <div class="spinner"></div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .dashboard-header h1 { font-size: 2rem; color: white; margin: 0; }
    .new-btn { padding: 0.8rem 1.5rem; background: linear-gradient(135deg, #8a2be2 0%, #6a1bb2 100%); border: none; border-radius: 10px; color: white; font-weight: 600; text-decoration: none; transition: all 0.2s; }
    .new-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(138, 43, 226, 0.4); }
    
    .reviews-section h2 { font-size: 1.3rem; color: #a0a0c0; margin: 0 0 1.5rem; font-weight: 500; }
    
    .reviews-table { background: linear-gradient(145deg, #1e1e2f 0%, #252538 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.05); }
    .table-header, .table-row { display: grid; grid-template-columns: 1fr 100px 120px 100px; align-items: center; padding: 1rem 1.5rem; }
    .table-header { background: rgba(0, 0, 0, 0.2); color: #666680; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .table-row { border-top: 1px solid rgba(255, 255, 255, 0.05); }
    .table-row:hover { background: rgba(138, 43, 226, 0.05); }
    
    .col-title { display: flex; flex-direction: column; gap: 0.25rem; }
    .col-title a { color: white; text-decoration: none; font-weight: 500; }
    .col-title a:hover { color: #b47cff; }
    .col-title small { color: #666680; font-size: 0.85rem; }
    
    .rating-badge { background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); color: white; font-weight: 700; padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.85rem; }
    
    .col-date { color: #a0a0c0; font-size: 0.9rem; }
    .col-actions { display: flex; gap: 0.5rem; }
    .action-btn { padding: 0.5rem; background: rgba(255, 255, 255, 0.05); border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; transition: all 0.2s; text-decoration: none; }
    .action-btn:hover { background: rgba(255, 255, 255, 0.1); transform: scale(1.1); }
    .action-btn.delete:hover { background: rgba(220, 53, 69, 0.2); }
    
    .empty-state { text-align: center; padding: 4rem; background: linear-gradient(145deg, #1e1e2f 0%, #252538 100%); border-radius: 16px; }
    .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
    .empty-state p { color: #666680; margin: 0 0 1.5rem; }
    
    .loading { display: flex; justify-content: center; padding: 4rem; }
    .spinner { width: 50px; height: 50px; border: 4px solid rgba(138, 43, 226, 0.2); border-top-color: #8a2be2; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  
  reviews: Review[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.api.getReviews(1, 100).subscribe({
      next: (response) => {
        this.reviews = response.reviews;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  deleteReview(id: number): void {
    if (confirm('Czy na pewno chcesz usunąć tę recenzję?')) {
      this.api.deleteReview(id).subscribe({
        next: () => this.loadReviews(),
        error: (err) => alert('Błąd podczas usuwania: ' + err.error?.error)
      });
    }
  }
}
