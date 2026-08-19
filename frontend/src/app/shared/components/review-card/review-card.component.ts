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
          <span class="placeholder-text">Recenzja</span>
        </div>
        
        <!-- Status Badge (Top-Left) -->
        <div class="card-status-badge" [ngClass]="'status-' + (review.gameStatus || 'main_story')">
          <span>{{ getStatusIcon(review.gameStatus) }}</span>
          <span>{{ getStatusLabel(review.gameStatus) }}</span>
        </div>

        <!-- Rating Badge (Top-Right) -->
        <div class="rating-badge">{{ review.averageRating.toFixed(1) }}</div>
      </div>
      <div class="card-content">
        <h3 class="game-title">{{ review.gameTitle }}</h3>
        <p class="review-title">{{ review.title }}</p>
        
        <div class="categories">
          <span *ngFor="let genre of review.genres" class="category-tag">{{ genre.name }}</span>
          <span *ngIf="review.studio" class="category-tag">{{ review.studio.name }}</span>
          <span *ngFor="let p of (review.platforms || []).slice(0, 2)" class="category-tag platform-tag">{{ p.name }}</span>
        </div>
        
        <div class="card-footer">
          <span class="date">{{ review.updatedAt | date:'dd.MM.yyyy' }}</span>
          <span class="playtime" *ngIf="review.playtimeHours > 0">
            ⏱️ {{ review.playtimeHours }}h
          </span>
        </div>
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
      font-size: 0.9rem;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    .card-status-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      font-family: var(--font-sans);
      letter-spacing: 0.3px;
      text-transform: uppercase;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      z-index: 2;
    }

    .card-status-badge.status-platyna {
      background: rgba(20, 20, 20, 0.85);
      color: #facc15;
      border: 1px solid rgba(250, 204, 21, 0.5);
    }

    .card-status-badge.status-main_story {
      background: rgba(20, 20, 20, 0.85);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.5);
    }

    .card-status-badge.status-in_progress {
      background: rgba(20, 20, 20, 0.85);
      color: #60a5fa;
      border: 1px solid rgba(96, 165, 250, 0.5);
    }

    .card-status-badge.status-abandoned {
      background: rgba(20, 20, 20, 0.85);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.5);
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

    .platform-tag {
      color: var(--accent-color);
      border-color: rgba(255, 122, 0, 0.25);
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-color);
      padding-top: 0.75rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .playtime {
      font-weight: 600;
      color: var(--text-color);
      font-size: 0.78rem;
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

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'platyna': return 'Platyna';
      case 'main_story': return 'Główny wątek';
      case 'in_progress': return 'W trakcie';
      case 'abandoned': return 'Porzucona';
      default: return 'Główny wątek';
    }
  }

  getStatusIcon(status?: string): string {
    switch (status) {
      case 'platyna': return '🏆';
      case 'main_story': return '🎯';
      case 'in_progress': return '⏳';
      case 'abandoned': return '🛑';
      default: return '🎮';
    }
  }
}
