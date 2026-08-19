import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Game } from '../../core/services/api.service';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReviewCardComponent],
  template: `
    <div class="search-container">
      <header class="search-header">
        <h1>Wyniki wyszukiwania</h1>
        <p *ngIf="query">dla frazy: <strong class="highlight">"{{ query }}"</strong></p>
      </header>

      <div class="search-box">
        <input 
          type="text" 
          [(ngModel)]="query" 
          (keyup.enter)="search()"
          placeholder="Szukaj gry lub recenzji..."
          class="search-input"
        >
        <button (click)="search()" class="search-btn">Szukaj</button>
      </div>

      <div class="results-count" *ngIf="!loading && games.length > 0">
        Znaleziono {{ pagination.total }} {{ pagination.total === 1 ? 'grę' : 'gier' }}
      </div>

      <div class="games-grid" *ngIf="games.length > 0">
        <app-review-card *ngFor="let game of games" [game]="game"></app-review-card>
      </div>

      <div class="empty-state" *ngIf="games.length === 0 && !loading && searched">
        <p>Brak wyników dla frazy "{{ query }}". Spróbuj innych słów kluczowych.</p>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 1160px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
    }
    .search-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .search-header h1 {
      font-size: 2.3rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--text-color);
      margin: 0 0 0.5rem;
    }
    .search-header p {
      color: var(--text-muted);
      margin: 0;
    }
    .search-header .highlight {
      color: var(--accent-color);
    }
    .search-box {
      display: flex;
      max-width: 540px;
      margin: 0 auto 2.5rem;
      gap: 0.75rem;
    }
    .search-input {
      flex: 1;
      padding: 0.75rem 1.25rem;
      background: var(--input-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-color);
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s ease;
    }
    .search-input:focus {
      border-color: var(--accent-color);
    }
    .search-btn {
      padding: 0.75rem 1.5rem;
      background-color: var(--accent-color);
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.95rem;
      transition: opacity 0.2s ease;
    }
    .search-btn:hover {
      opacity: 0.9;
    }
    .results-count {
      text-align: center;
      color: var(--text-muted);
      margin-bottom: 2rem;
      font-size: 0.9rem;
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
    .loading {
      display: flex;
      justify-content: center;
      padding: 6rem 0;
    }
    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top: 3px solid var(--accent-color);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class SearchComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  query = '';
  games: Game[] = [];
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
    this.api.searchGames(this.query).subscribe({
      next: (response) => {
        this.games = response.games || [];
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
