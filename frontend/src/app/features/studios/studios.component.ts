import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService, Category, Review } from '../../core/services/api.service';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';

@Component({
  selector: 'app-studios',
  standalone: true,
  imports: [CommonModule, RouterLink, ReviewCardComponent],
  template: `
    <div class="page-container">
      <ng-container *ngIf="!selectedStudio">
        <h1 class="page-title">Przegląd po studiach</h1>

        <ul class="plain-list">
          <li *ngFor="let studio of studios">
            <a [routerLink]="['/studios', studio.slug]">{{ studio.name }}</a>
          </li>
        </ul>

        <p class="empty" *ngIf="studios.length === 0 && !loading">Brak studiów.</p>
      </ng-container>

      <ng-container *ngIf="selectedStudio">
        <a routerLink="/studios" class="back-link">← Wszystkie studia</a>
        <h1 class="page-title">{{ selectedStudio.name }}</h1>

        <div class="reviews-grid" *ngIf="reviews.length > 0">
          <app-review-card *ngFor="let review of reviews" [review]="review"></app-review-card>
        </div>

        <p class="empty" *ngIf="reviews.length === 0 && !loading">Brak recenzji tego studia.</p>
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
export class StudiosComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  studios: Category[] = [];
  selectedStudio: Category | null = null;
  reviews: Review[] = [];
  loading = true;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['slug']) {
        this.loadStudioReviews(params['slug']);
      } else {
        this.loadStudios();
      }
    });
  }

  loadStudios(): void {
    this.loading = true;
    this.selectedStudio = null;
    this.api.getStudios().subscribe({
      next: (studios) => { this.studios = studios; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadStudioReviews(slug: string): void {
    this.loading = true;
    this.api.getStudioReviews(slug).subscribe({
      next: (data) => { this.selectedStudio = data.studio || null; this.reviews = data.reviews; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
