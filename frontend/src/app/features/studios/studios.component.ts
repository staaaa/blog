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
        <header class="page-header">
          <h1>🏢 <span class="highlight">Studia</span> Gier</h1>
          <p>Przeglądaj recenzje według studia</p>
        </header>

        <div class="categories-grid">
          <a *ngFor="let studio of studios" 
             [routerLink]="['/studios', studio.slug]" 
             class="category-card">
            <span class="category-name">{{ studio.name }}</span>
            <span class="category-arrow">→</span>
          </a>
        </div>

        <div class="empty-state" *ngIf="studios.length === 0 && !loading">
          <span class="empty-icon">📭</span>
          <p>Brak studiów do wyświetlenia</p>
        </div>
      </ng-container>

      <ng-container *ngIf="selectedStudio">
        <header class="page-header">
          <a routerLink="/studios" class="back-link">← Wszystkie studia</a>
          <h1>🏢 <span class="highlight">{{ selectedStudio.name }}</span></h1>
          <p>Recenzje gier studia {{ selectedStudio.name }}</p>
        </header>

        <div class="reviews-grid" *ngIf="reviews.length > 0">
          <app-review-card *ngFor="let review of reviews" [review]="review"></app-review-card>
        </div>

        <div class="empty-state" *ngIf="reviews.length === 0 && !loading">
          <span class="empty-icon">📭</span>
          <p>Brak recenzji tego studia</p>
        </div>
      </ng-container>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
    .page-header { text-align: center; margin-bottom: 3rem; }
    .page-header h1 { font-size: 2.5rem; font-weight: 800; color: white; margin: 0 0 0.5rem; }
    .page-header .highlight { background: linear-gradient(135deg, #00d4aa 0%, #00a080 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .page-header p { color: #a0a0c0; font-size: 1.1rem; margin: 0; }
    .back-link { display: inline-block; margin-bottom: 1rem; color: #00d9a5; text-decoration: none; font-weight: 500; }
    .back-link:hover { color: #00ffbb; }
    .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
    .category-card { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; background: linear-gradient(145deg, #1e1e2f 0%, #252538 100%); border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.05); text-decoration: none; color: white; transition: all 0.3s ease; }
    .category-card:hover { transform: translateY(-4px); border-color: rgba(0, 200, 150, 0.3); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
    .category-name { font-size: 1.2rem; font-weight: 600; }
    .category-arrow { font-size: 1.5rem; color: #00d4aa; transition: transform 0.2s; }
    .category-card:hover .category-arrow { transform: translateX(5px); }
    .reviews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }
    .empty-state { text-align: center; padding: 4rem; color: #666680; }
    .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
    .loading { display: flex; justify-content: center; padding: 4rem; }
    .spinner { width: 50px; height: 50px; border: 4px solid rgba(0, 200, 150, 0.2); border-top-color: #00d4aa; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
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
