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
        <h1>Dashboard</h1>
        <div class="header-buttons">
          <button (click)="cleanupImages()" class="cleanup-btn" [disabled]="cleaning">
            {{ cleaning ? 'Czyszczenie...' : 'Wyczyść nieużywane zdjęcia' }}
          </button>
          <a routerLink="/admin/review/new" class="new-btn">Nowa Recenzja</a>
        </div>
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
              <a [routerLink]="['/review', review.id]">
                {{ review.gameTitle }}
                <span *ngIf="review.isDraft" class="draft-badge">ROBOCZA</span>
              </a>
              <small>{{ review.title }}</small>
            </span>
            <span class="col-rating">
              <span class="rating-badge">{{ review.averageRating.toFixed(1) }}</span>
            </span>
            <span class="col-date">{{ review.updatedAt | date:'dd.MM.yyyy' }}</span>
            <span class="col-actions">
              <a [routerLink]="['/admin/review', review.id]" class="action-link edit">Edytuj</a>
              <button (click)="deleteReview(review.id)" class="action-btn-text delete">Usuń</button>
            </span>
          </div>
        </div>

        <div class="empty-state" *ngIf="reviews.length === 0 && !loading">
          <p>Brak recenzji. Dodaj swoją pierwszą!</p>
          <a routerLink="/admin/review/new" class="new-btn">Dodaj recenzję</a>
        </div>

        <div class="loading" *ngIf="loading">
          <div class="spinner"></div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
    }
    .dashboard-header h1 {
      font-size: 2rem;
      font-weight: 300;
      font-family: var(--font-serif);
      color: var(--text-color);
      margin: 0;
    }
    .header-buttons {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .cleanup-btn {
      padding: 0.5rem 1rem;
      background: var(--input-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-color);
      font-weight: 500;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .cleanup-btn:hover:not(:disabled) {
      border-color: var(--accent-color);
      color: var(--accent-color);
    }
    .cleanup-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .new-btn {
      padding: 0.5rem 1rem;
      background-color: var(--accent-color);
      border: none;
      border-radius: 6px;
      color: white;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.9rem;
      transition: background-color 0.2s ease;
    }
    .new-btn:hover {
      background-color: var(--accent-hover);
    }
    
    .reviews-section h2 {
      font-size: 1.25rem;
      font-family: var(--font-serif);
      font-weight: 300;
      color: var(--text-muted);
      margin: 0 0 1.5rem;
    }
    
    .reviews-table {
      background-color: var(--card-bg);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 12px var(--shadow);
    }
    .table-header, .table-row {
      display: grid;
      grid-template-columns: 1fr 100px 120px 120px;
      align-items: center;
      padding: 1rem 1.5rem;
    }
    .table-header {
      background: var(--input-bg);
      border-bottom: 1px solid var(--border-color);
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .table-row {
      border-top: 1px solid var(--border-color);
    }
    .table-row:first-child {
      border-top: none;
    }
    .table-row:hover {
      background-color: var(--input-bg);
    }
    
    .col-title {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .col-title a {
      color: var(--text-color);
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
    }
    .col-title a:hover {
      color: var(--accent-color);
    }
    .col-title small {
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    
    .draft-badge {
      display: inline-block;
      margin-left: 0.5rem;
      padding: 0.15rem 0.4rem;
      background: rgba(255, 122, 0, 0.15);
      border: 1px solid rgba(255, 122, 0, 0.3);
      color: var(--accent-color);
      border-radius: 4px;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      vertical-align: middle;
    }
    
    .rating-badge {
      background-color: var(--input-bg);
      border: 1px solid var(--border-color);
      color: var(--accent-color);
      font-weight: 700;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.85rem;
    }
    
    .col-date {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .col-actions {
      display: flex;
      gap: 1rem;
      font-size: 0.85rem;
    }
    .action-link {
      color: var(--accent-color);
      text-decoration: none;
      font-weight: 600;
    }
    .action-link:hover {
      color: var(--accent-hover);
      text-decoration: underline;
    }
    .action-btn-text {
      background: transparent;
      border: none;
      cursor: pointer;
      font-weight: 600;
      color: #ff6b7a;
      padding: 0;
    }
    .action-btn-text:hover {
      text-decoration: underline;
    }
    
    .empty-state {
      text-align: center;
      padding: 6rem 0;
      background-color: var(--card-bg);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      color: var(--text-muted);
    }
    .empty-state p {
      margin-bottom: 1.5rem;
    }
    
    .loading {
      display: flex;
      justify-content: center;
      padding: 6rem 0;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  
  reviews: Review[] = [];
  loading = true;
  cleaning = false;

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

  cleanupImages(): void {
    if (confirm('Czy na pewno chcesz przeskanować bazę danych i usunąć z serwera wszystkie nieużywane pliki graficzne?')) {
      this.cleaning = true;
      this.api.cleanupUploads().subscribe({
        next: (res) => {
          this.cleaning = false;
          alert(`Zakończono czyszczenie:\n- Usunięto nieużywanych plików: ${res.deletedCount}\n- Zwolniono miejsca: ${res.freedMb} MB`);
        },
        error: (err) => {
          this.cleaning = false;
          alert('Błąd podczas czyszczenia: ' + (err.error?.error || err.message));
        }
      });
    }
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
