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
          <!-- Text placeholder instead of emoji -->
          <span class="placeholder-text">Recenzja</span>
        </div>
        <div class="rating-badge">{{ review.averageRating.toFixed(1) }}</div>
      </div>
      <div class="card-content">
        <h3 class="game-title">{{ review.gameTitle }}</h3>
        <p class="review-title">{{ review.title }}</p>
        <div class="categories">
          <span *ngFor="let genre of review.genres" class="category-tag">{{ genre.name }}</span>
          <span *ngIf="review.studio" class="category-tag">{{ review.studio.name }}</span>
        </div>
        <div class="date">{{ review.updatedAt | date:'dd.MM.yyyy' }}</div>
      </div>
    </a>
  `,
  styles: [`
    .review-card {
      display: block;
      background-color: var(--card-bg);
      border-radius: 12px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      border: 1px solid var(--border-color);
      transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
    }

    .review-card:hover {
      transform: translateY(-4px);
      border-color: var(--accent-color);
      box-shadow: 0 12px 24px var(--shadow);
    }

    .card-image {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      background-color: var(--input-bg);
      border-bottom: 1px solid var(--border-color);
    }

    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .review-card:hover .card-image img {
      transform: scale(1.03);
    }

    .placeholder-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--input-bg);
    }

    .placeholder-text {
      color: var(--text-muted);
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .rating-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background-color: var(--accent-color);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.95rem;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
    }

    .card-content {
      padding: 1.25rem;
    }

    .game-title {
      font-size: 1.15rem;
      font-weight: 700;
      margin: 0 0 0.4rem;
      color: var(--text-color);
      line-height: 1.3;
    }

    .review-title {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0 0 1rem;
      line-height: 1.4;
    }

    .categories {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: 1rem;
    }

    .category-tag {
      font-size: 0.75rem;
      color: var(--text-muted);
      background-color: var(--input-bg);
      border: 1px solid var(--border-color);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
    }

    .date {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
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
