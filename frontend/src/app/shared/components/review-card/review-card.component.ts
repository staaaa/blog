import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Game, Review } from '../../../core/services/api.service';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a [routerLink]="getGameLink()" class="game-card">
      <div class="card-image">
        <img *ngIf="getCoverImage()" [src]="getImageUrl(getCoverImage())" [alt]="getTitle()">
        <div *ngIf="!getCoverImage()" class="placeholder-image">
          <span class="placeholder-text">Gra</span>
        </div>
        
        <!-- Review Count Badge (Top-Left) -->
        <div class="card-count-badge" *ngIf="getReviewCount() > 0">
          <span>{{ getReviewCount() }} {{ getReviewCount() === 1 ? 'recenzja' : 'recenzje' }}</span>
        </div>

        <!-- Rating Badge (Top-Right) -->
        <div class="rating-badge" *ngIf="getAverageRating() > 0">
          <span>{{ getAverageRating().toFixed(1) }}</span>
        </div>
      </div>

      <div class="card-content">
        <h3 class="game-title">{{ getTitle() }}</h3>
        
        <div class="reviewers-avatars-row" *ngIf="getReviewers().length > 0">
          <span class="reviewers-label">Recenzje:</span>
          <div class="avatar-stack">
            <span
              *ngFor="let rev of getReviewers().slice(0, 4)"
              class="reviewer-mini-avatar"
              [title]="rev.displayName + ' (ocena: ' + rev.averageRating.toFixed(1) + ')'"
            >
              <img *ngIf="rev.avatarUrl" [src]="getImageUrl(rev.avatarUrl)" [alt]="rev.displayName" />
              <span *ngIf="!rev.avatarUrl">{{ (rev.displayName || 'R')[0].toUpperCase() }}</span>
            </span>
          </div>
        </div>
        
        <div class="categories">
          <span *ngFor="let genre of getGenres()" class="category-tag">{{ genre.name }}</span>
          <span *ngIf="getStudio()" class="category-tag">{{ getStudio()?.name }}</span>
          <span *ngFor="let p of getPlatforms().slice(0, 2)" class="category-tag platform-tag">{{ p.name }}</span>
        </div>
        
        <div class="card-footer">
          <span class="date">{{ getReleaseDate() ? ('Premiera: ' + (getReleaseDate() | date:'dd.MM.yyyy')) : (getUpdatedAt() | date:'dd.MM.yyyy') }}</span>
          <span class="view-link">Zobacz recenzje →</span>
        </div>
      </div>
    </a>
  `,
  styles: [`
    .game-card {
      display: block;
      background-color: var(--card-bg);
      border-radius: 12px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      border: 1px solid var(--border-color);
      transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
    }

    .game-card:hover {
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

    .game-card:hover .card-image img {
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

    .card-count-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      font-family: var(--font-sans);
      letter-spacing: 0.3px;
      background: rgba(20, 20, 24, 0.85);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      z-index: 2;
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

    .reviewers-avatars-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .reviewers-label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .avatar-stack {
      display: flex;
      align-items: center;
    }

    .reviewer-mini-avatar {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--accent-color);
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid var(--card-bg);
      margin-left: -5px;
    }

    .reviewer-mini-avatar:first-child {
      margin-left: 0;
    }

    .reviewer-mini-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
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

    .view-link {
      color: var(--accent-color);
      font-weight: 600;
      font-size: 0.78rem;
    }
  `]
})
export class ReviewCardComponent {
  @Input() game?: Game;
  @Input() review?: Review;

  getGameLink(): string[] {
    if (this.game && this.game.slug) {
      return ['/game', this.game.slug];
    }
    if (this.review) {
      if (this.review.game && this.review.game.slug) {
        return ['/game', this.review.game.slug];
      }
      return ['/review', this.review.id.toString()];
    }
    return ['/'];
  }

  getTitle(): string {
    return this.game?.gameTitle || this.review?.gameTitle || this.review?.title || '';
  }

  getCoverImage(): string | null {
    return this.game?.coverImage || this.review?.coverImage || null;
  }

  getAverageRating(): number {
    return this.game?.averageRating || this.review?.averageRating || 0;
  }

  getReviewCount(): number {
    if (this.game && this.game.reviewCount !== undefined) {
      return this.game.reviewCount;
    }
    return 1;
  }

  getReviewers(): any[] {
    return this.game?.reviewers || [];
  }

  getGenres(): any[] {
    return this.game?.genres || this.review?.genres || [];
  }

  getStudio(): any {
    return this.game?.studio || this.review?.studio || null;
  }

  getPlatforms(): any[] {
    return this.game?.platforms || this.review?.platforms || [];
  }

  getReleaseDate(): string | null {
    return this.game?.releaseDate || this.review?.releaseDate || null;
  }

  getUpdatedAt(): string {
    return this.game?.updatedAt || this.review?.updatedAt || '';
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return url;
    return '/uploads/' + url;
  }
}
