import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService, Category, Game } from '../../core/services/api.service';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';

@Component({
  selector: 'app-studios',
  standalone: true,
  imports: [CommonModule, RouterLink, ReviewCardComponent],
  template: `
    <div class="page-container">
      <ng-container *ngIf="!selectedStudio">
        <h1 class="page-title">Przegląd po studiach i deweloperach</h1>

        <ul class="plain-list">
          <li *ngFor="let s of studios">
            <a [routerLink]="['/studios', s.slug]">{{ s.name }}</a>
          </li>
        </ul>

        <p class="empty" *ngIf="studios.length === 0 && !loading">Brak studiów.</p>
      </ng-container>

      <ng-container *ngIf="selectedStudio">
        <a routerLink="/studios" class="back-link">← Wszystkie studia</a>
        <h1 class="page-title">Studio: {{ selectedStudio.name }}</h1>

        <div class="reviews-grid" *ngIf="games.length > 0">
          <app-review-card *ngFor="let game of games" [game]="game"></app-review-card>
        </div>

        <p class="empty" *ngIf="games.length === 0 && !loading">Brak gier tego studia.</p>
      </ng-container>

      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; margin: 0 auto; padding: 2.5rem 1.5rem; }
    .page-title { font-size: 2.2rem; font-weight: 800; color: var(--text-color); margin: 0 0 2rem; }
    .back-link { display: inline-block; margin-bottom: 1rem; color: var(--accent-color); text-decoration: none; font-size: 0.9rem; font-weight: 600; }
    .back-link:hover { text-decoration: underline; }

    .plain-list { list-style: none; padding: 0; margin: 0; }
    .plain-list li { padding: 0.75rem 0; border-bottom: 1px solid var(--border-color); }
    .plain-list li:last-child { border-bottom: none; }
    .plain-list a { color: var(--text-primary); text-decoration: none; font-size: 1.1rem; font-weight: 600; transition: color 0.15s ease; }
    .plain-list a:hover { color: var(--accent-color); }

    .reviews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
    .empty { color: var(--text-muted); margin-top: 2rem; }
    .loading { display: flex; justify-content: center; padding: 4rem 0; }
    .spinner { border: 3px solid rgba(255, 255, 255, 0.1); border-top: 3px solid var(--accent-color); border-radius: 50%; width: 36px; height: 36px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

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
  games: Game[] = [];
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
      next: (studios) => {
        this.studios = studios;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadStudioReviews(slug: string): void {
    this.loading = true;
    this.api.getStudioReviews(slug).subscribe({
      next: (data) => {
        this.selectedStudio = data.studio || null;
        this.games = (data.games || data.reviews || []) as Game[];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
