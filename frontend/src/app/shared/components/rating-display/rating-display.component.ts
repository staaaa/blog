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
          <span class="rating-name">📖 Fabuła</span>
          <div class="rating-bar-container">
            <div class="rating-bar" [style.width.%]="storyRating * 10" [style.background]="getRatingColor(storyRating)"></div>
          </div>
          <span class="rating-score">{{ storyRating.toFixed(1) }}</span>
        </div>

        <div class="rating-item">
          <span class="rating-name">🎵 Muzyka</span>
          <div class="rating-bar-container">
            <div class="rating-bar" [style.width.%]="musicRating * 10" [style.background]="getRatingColor(musicRating)"></div>
          </div>
          <span class="rating-score">{{ musicRating.toFixed(1) }}</span>
        </div>

        <div class="rating-item">
          <span class="rating-name">🎨 Grafika</span>
          <div class="rating-bar-container">
            <div class="rating-bar" [style.width.%]="graphicsRating * 10" [style.background]="getRatingColor(graphicsRating)"></div>
          </div>
          <span class="rating-score">{{ graphicsRating.toFixed(1) }}</span>
        </div>

        <div class="rating-item">
          <span class="rating-name">⚡ Optymalizacja</span>
          <div class="rating-bar-container">
            <div class="rating-bar" [style.width.%]="optimizationRating * 10" [style.background]="getRatingColor(optimizationRating)"></div>
          </div>
          <span class="rating-score">{{ optimizationRating.toFixed(1) }}</span>
        </div>

        <div class="rating-item">
          <span class="rating-name">🎮 Gameplay</span>
          <div class="rating-bar-container">
            <div class="rating-bar" [style.width.%]="gameplayRating * 10" [style.background]="getRatingColor(gameplayRating)"></div>
          </div>
          <span class="rating-score">{{ gameplayRating.toFixed(1) }}</span>
        </div>

        <ng-container *ngFor="let custom of customRatings">
          <div class="rating-item custom">
            <span class="rating-name">⭐ {{ custom.scaleName }}</span>
            <div class="rating-bar-container">
              <div class="rating-bar" [style.width.%]="custom.value * 10" [style.background]="getRatingColor(custom.value)"></div>
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
      gap: 2rem;
      padding: 1.5rem;
      background: linear-gradient(145deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 35, 0.9) 100%);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .main-rating {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .rating-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .rating-inner {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #1a1a2e;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .rating-value {
      font-size: 1.8rem;
      font-weight: 800;
      color: white;
    }

    .rating-label {
      font-size: 0.85rem;
      color: #a0a0c0;
      font-weight: 500;
    }

    .rating-bars {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      min-width: 0;
    }

    .rating-item {
      display: grid;
      grid-template-columns: 160px 1fr 40px;
      align-items: center;
      gap: 0.75rem;
    }

    .rating-name {
      font-size: 0.85rem;
      color: #d0d0e0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .rating-bar-container {
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
      min-width: 60px;
    }

    .rating-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .rating-score {
      text-align: right;
      font-weight: 600;
      color: white;
      font-size: 0.85rem;
    }

    .rating-item.custom .rating-name {
      color: #ffd700;
    }

    @media (max-width: 768px) {
      .rating-display {
        flex-direction: column;
        align-items: center;
      }

      .rating-item {
        grid-template-columns: 120px 1fr 35px;
        gap: 0.5rem;
      }

      .rating-name {
        font-size: 0.75rem;
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

  getRatingColor(rating: number): string {
    // Smooth gradient from red (0) -> yellow (5) -> green (10)
    const r = Math.round(rating <= 5 ? 255 : 255 - ((rating - 5) / 5) * 255);
    const g = Math.round(rating <= 5 ? (rating / 5) * 255 : 255);
    const b = 50;
    return `rgb(${r}, ${g}, ${b})`;
  }

  getCircleGradient(rating: number): string {
    const color = this.getRatingColor(rating);
    const percent = (rating / 10) * 100;
    const degrees = (percent / 100) * 360;
    return `conic-gradient(${color} 0deg, ${color} ${degrees}deg, rgba(255,255,255,0.1) ${degrees}deg, rgba(255,255,255,0.1) 360deg)`;
  }
}
