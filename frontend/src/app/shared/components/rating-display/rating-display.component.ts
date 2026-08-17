import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomRating } from '../../../core/services/api.service';

@Component({
  selector: 'app-rating-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rating-display">
      <div class="main-rating">
        <div class="rating-circle" [style.background]="getCircleGradient(averageRating)">
          <div class="rating-inner">
            <span class="rating-value">{{ averageRating.toFixed(1) }}</span>
          </div>
        </div>
        <span class="rating-label">Średnia ocena</span>
      </div>

      <div class="rating-bars">
        <div class="rating-item">
          <span class="rating-name">Fabuła</span>
          <div class="rating-bar-container">
            <div class="rating-bar" [style.width.%]="storyRating * 10"></div>
          </div>
          <span class="rating-score">{{ storyRating.toFixed(1) }}</span>
        </div>

        <div class="rating-item">
          <span class="rating-name">Muzyka</span>
          <div class="rating-bar-container">
            <div class="rating-bar" [style.width.%]="musicRating * 10"></div>
          </div>
          <span class="rating-score">{{ musicRating.toFixed(1) }}</span>
        </div>

        <div class="rating-item">
          <span class="rating-name">Grafika</span>
          <div class="rating-bar-container">
            <div class="rating-bar" [style.width.%]="graphicsRating * 10"></div>
          </div>
          <span class="rating-score">{{ graphicsRating.toFixed(1) }}</span>
        </div>

        <div class="rating-item">
          <span class="rating-name">Optymalizacja</span>
          <div class="rating-bar-container">
            <div class="rating-bar" [style.width.%]="optimizationRating * 10"></div>
          </div>
          <span class="rating-score">{{ optimizationRating.toFixed(1) }}</span>
        </div>

        <div class="rating-item">
          <span class="rating-name">Gameplay</span>
          <div class="rating-bar-container">
            <div class="rating-bar" [style.width.%]="gameplayRating * 10"></div>
          </div>
          <span class="rating-score">{{ gameplayRating.toFixed(1) }}</span>
        </div>

        <ng-container *ngFor="let custom of customRatings">
          <div class="rating-item">
            <span class="rating-name">{{ custom.scaleName }}</span>
            <div class="rating-bar-container">
              <div class="rating-bar" [style.width.%]="custom.value * 10"></div>
            </div>
            <span class="rating-score">{{ custom.value.toFixed(1) }}</span>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .rating-display {
      display: flex;
      gap: 2.5rem;
      padding: 1.5rem;
      background-color: var(--card-bg);
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }

    .main-rating {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
      justify-content: center;
    }

    .rating-circle {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .rating-inner {
      width: 74px;
      height: 74px;
      border-radius: 50%;
      background-color: var(--card-bg);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .rating-value {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-color);
      letter-spacing: -0.5px;
    }

    .rating-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .rating-bars {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      min-width: 0;
      justify-content: center;
    }

    .rating-item {
      display: grid;
      grid-template-columns: 140px 1fr 40px;
      align-items: center;
      gap: 1rem;
    }

    .rating-name {
      font-size: 0.85rem;
      color: var(--text-color);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .rating-bar-container {
      height: 6px;
      background-color: var(--input-bg);
      border: 1px solid var(--border-color);
      border-radius: 3px;
      overflow: hidden;
      min-width: 60px;
    }

    .rating-bar {
      height: 100%;
      background-color: var(--accent-color);
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    .rating-score {
      text-align: right;
      font-weight: 600;
      color: var(--text-color);
      font-size: 0.85rem;
    }

    @media (max-width: 768px) {
      .rating-display {
        flex-direction: column;
        align-items: stretch;
        gap: 1.5rem;
        border-radius: 0;
        border-left: none;
        border-right: none;
        padding: 1.5rem 1rem;
      }

      .rating-item {
        grid-template-columns: 100px 1fr 35px;
        gap: 0.75rem;
      }

      .rating-name {
        font-size: 0.8rem;
      }
    }
  `]
})
export class RatingDisplayComponent {
  @Input() averageRating: number = 0;
  @Input() storyRating: number = 0;
  @Input() musicRating: number = 0;
  @Input() graphicsRating: number = 0;
  @Input() optimizationRating: number = 0;
  @Input() gameplayRating: number = 0;
  @Input() customRatings: CustomRating[] = [];

  getCircleGradient(rating: number): string {
    const percent = (rating / 10) * 100;
    const degrees = (percent / 100) * 360;
    // Conic gradient using CSS variable theme colors
    return `conic-gradient(var(--accent-color) 0deg, var(--accent-color) ${degrees}deg, var(--border-color) ${degrees}deg, var(--border-color) 360deg)`;
  }
}
