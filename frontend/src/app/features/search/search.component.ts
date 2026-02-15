import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Review } from '../../core/services/api.service';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReviewCardComponent],
  template: `
    <div class="search-container">
      <header class="search-header">
        <h1>🔍 Wyniki wyszukiwania</h1>
        <p *ngIf="query">dla: <strong>{{ query }}</strong></p>
      </header>

      <div class="search-box">
        <input 
          type="text" 
          [(ngModel)]="query" 
          (keyup.enter)="search()"
          placeholder="Szukaj gry..."
          class="search-input"
        >
        <button (click)="search()" class="search-btn">Szukaj</button>
      </div>

      <div class="results-count" *ngIf="!loading && reviews.length > 0">
        Znaleziono {{ pagination.total }} wyników
      </div>

      <div class="reviews-grid" *ngIf="reviews.length > 0">
        <app-review-card *ngFor="let review of reviews" [review]="review"></app-review-card>
      </div>

      <div class="empty-state" *ngIf="reviews.length === 0 && !loading && searched">
        <span class="empty-icon">🔎</span>
        <p>Brak wyników dla "{{ query }}"</p>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .search-container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
    .search-header { text-align: center; margin-bottom: 2rem; }
    .search-header h1 { font-size: 2rem; color: white; margin: 0 0 0.5rem; }
    .search-header p { color: #a0a0c0; margin: 0; }
    .search-header strong { color: #b47cff; }
    .search-box { display: flex; max-width: 600px; margin: 0 auto 2rem; gap: 1rem; }
    .search-input { flex: 1; padding: 1rem 1.5rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: white; font-size: 1rem; outline: none; transition: border-color 0.2s; }
    .search-input:focus { border-color: rgba(138, 43, 226, 0.5); }
    .search-btn { padding: 1rem 2rem; background: linear-gradient(135deg, #8a2be2 0%, #6a1bb2 100%); border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
    .search-btn:hover { transform: translateY(-2px); }
    .results-count { text-align: center; color: #a0a0c0; margin-bottom: 2rem; }
    .reviews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }
    .empty-state { text-align: center; padding: 4rem; color: #666680; }
    .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
    .loading { display: flex; justify-content: center; padding: 4rem; }
    .spinner { width: 50px; height: 50px; border: 4px solid rgba(138, 43, 226, 0.2); border-top-color: #8a2be2; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class SearchComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  query = '';
  reviews: Review[] = [];
  loading = false;
  searched = false;
  pagination = { page: 1, totalPages: 1, total: 0, limit: 12 };

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.query = params['q'];
        this.search();
      }
    });
  }

  search(): void {
    if (!this.query.trim()) return;
    this.loading = true;
    this.searched = true;
    this.api.searchReviews(this.query).subscribe({
      next: (response) => {
        this.reviews = response.reviews;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
