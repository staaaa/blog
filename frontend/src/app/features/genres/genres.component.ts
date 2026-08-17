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
      <ng-container *ngIf="!selectedGenre">
        <h1 class="page-title">Przegląd po gatunkach</h1>

        <ul class="plain-list">
          <li *ngFor="let genre of genres">
            <a [routerLink]="['/genres', genre.slug]">{{ genre.name }}</a>
          </li>
        </ul>

        <p class="empty" *ngIf="genres.length === 0 && !loading">Brak gatunków.</p>
      </ng-container>

      <ng-container *ngIf="selectedGenre">
        <a routerLink="/genres" class="back-link">← Wszystkie gatunki</a>
        <h1 class="page-title">{{ selectedGenre.name }}</h1>

        <div class="reviews-grid" *ngIf="reviews.length > 0">
          <app-review-card *ngFor="let review of reviews" [review]="review"></app-review-card>
        </div>

        <p class="empty" *ngIf="reviews.length === 0 && !loading">Brak recenzji w tym gatunku.</p>
      </ng-container>

      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; margin: 0 auto; padding: 2.5rem 1.5rem; }
    .page-title { font-size: 2rem; font-weight: 300; font-family: var(--font-serif); color: var(--text-color); margin: 0 0 2rem; }
    .back-link { display: inline-block; margin-bottom: 1rem; color: var(--accent-color); text-decoration: underline; font-size: 0.9rem; font-weight: 500; }
    .back-link:hover { color: var(--accent-hover); }

    .plain-list { list-style: none; padding: 0; margin: 0; }
    .plain-list li { padding: 0.6rem 0; border-bottom: 1px solid var(--border-color); }
    .plain-list li:last-child { border-bottom: none; }
    .plain-list a { color: var(--accent-color); text-decoration: underline; font-size: 1.1rem; transition: color 0.15s ease; }
    .plain-list a:hover { color: var(--accent-hover); }

    .reviews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; max-width: 1100px; }
    .empty { color: var(--text-muted); margin-top: 2rem; }
    .loading { display: flex; justify-content: center; padding: 4rem 0; }

    @media (max-width: 768px) {
      .page-container { padding: 1.5rem 1rem; }
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
