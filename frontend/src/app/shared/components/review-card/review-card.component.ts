import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Review } from '../../../core/services/api.service';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a [routerLink]="['/review', review.id]" class="review-card">
      <div class="card-image">
        <img *ngIf="review.coverImage" [src]="getImageUrl(review.coverImage)" [alt]="review.gameTitle">
        <div *ngIf="!review.coverImage" class="placeholder-image">
          <span>🎮</span>
        </div>
        <div class="rating-badge">{{ review.averageRating.toFixed(1) }}</div>
      </div>
      <div class="card-content">
        <h3 class="game-title">{{ review.gameTitle }}</h3>
        <p class="review-title">{{ review.title }}</p>
        <div class="categories">
          <span *ngFor="let genre of review.genres" class="category-tag genre">{{ genre.name }}</span>
          <span *ngIf="review.studio" class="category-tag studio">{{ review.studio.name }}</span>
        </div>
        <div class="date">{{ review.updatedAt | date:'dd.MM.yyyy' }}</div>
      </div>
    </a>
  `,
  styles: [`
    .review-card { display: block; background: linear-gradient(145deg, #1e1e2f 0%, #252538 100%); border-radius: 16px; overflow: hidden; text-decoration: none; color: inherit; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(255, 255, 255, 0.05); }
    .review-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); border-color: rgba(138, 43, 226, 0.3); }
    .card-image { position: relative; width: 100%; aspect-ratio: 16 / 9; overflow: hidden; }
    .card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
    .review-card:hover .card-image img { transform: scale(1.05); }
    .placeholder-image { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #2a2a4a 0%, #1a1a2e 100%); font-size: 4rem; }
    .rating-badge { position: absolute; top: 12px; right: 12px; background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); color: white; font-weight: 700; font-size: 1.1rem; padding: 0.4rem 0.8rem; border-radius: 8px; box-shadow: 0 4px 15px rgba(138, 43, 226, 0.4); }
    .card-content { padding: 1.25rem; }
    .game-title { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.5rem; color: #ffffff; line-height: 1.3; }
    .review-title { font-size: 0.9rem; color: #a0a0c0; margin: 0 0 1rem; line-height: 1.4; }
    .categories { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .category-tag { font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 20px; font-weight: 500; }
    .category-tag.genre { background: rgba(138, 43, 226, 0.2); color: #b47cff; border: 1px solid rgba(138, 43, 226, 0.3); }
    .category-tag.studio { background: rgba(0, 200, 150, 0.2); color: #00d9a5; border: 1px solid rgba(0, 200, 150, 0.3); }
    .date { font-size: 0.8rem; color: #666680; }
  `]
})
export class ReviewCardComponent {
  @Input() review!: Review;

  getImageUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return url;
    return '/uploads/' + url;
  }
}

