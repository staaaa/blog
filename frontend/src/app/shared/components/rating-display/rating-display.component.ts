import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomRating } from '../../../core/services/api.service';
import { RadarChartComponent } from '../radar-chart/radar-chart.component';

@Component({
  selector: 'app-rating-display',
  standalone: true,
  imports: [CommonModule, RadarChartComponent],
  template: `
    <div class="rating-display">
      <div class="rating-header-bar">
        <div class="main-rating">
          <div class="rating-circle" [style.background]="getCircleGradient(averageRating)">
            <div class="rating-inner">
              <span class="rating-value">{{ averageRating.toFixed(1) }}</span>
            </div>
          </div>
          <span class="rating-label">Średnia ocena</span>
        </div>

        <div class="view-toggles">
          <button 
            type="button" 
            class="toggle-btn" 
            [class.active]="viewMode === 'bars'" 
            (click)="viewMode = 'bars'"
            title="Widok pasków"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="16" y2="12"></line>
              <line x1="4" y1="18" x2="18" y2="18"></line>
            </svg>
            <span>Paski</span>
          </button>
          <button 
            type="button" 
            class="toggle-btn" 
            [class.active]="viewMode === 'radar'" 
            (click)="viewMode = 'radar'"
            title="Wykres radarowy"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
            </svg>
            <span>Radar</span>
          </button>
        </div>
      </div>

      <!-- Bars View -->
      <div class="rating-bars" *ngIf="viewMode === 'bars'">
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

      <!-- Radar View -->
      <div class="rating-radar-view" *ngIf="viewMode === 'radar'">
        <app-radar-chart
          [storyRating]="storyRating"
          [musicRating]="musicRating"
          [graphicsRating]="graphicsRating"
          [optimizationRating]="optimizationRating"
          [gameplayRating]="gameplayRating"
          [customRatings]="customRatings"
        ></app-radar-chart>
      </div>
    </div>
  `,
  styles: [`
    .rating-display {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.5rem;
      background-color: var(--card-bg);
      border-radius: 12px;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 12px var(--shadow);
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
    }

    .rating-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-color);
    }

    .main-rating {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .view-toggles {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--input-bg);
      padding: 0.25rem;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.85rem;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: var(--text-muted);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .toggle-btn:hover {
      color: var(--text-color);
    }

    .toggle-btn.active {
      background: var(--card-bg);
      color: var(--accent-color);
      box-shadow: 0 2px 6px var(--shadow);
    }

    .rating-circle {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      flex-shrink: 0;
    }

    .rating-inner {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background-color: var(--card-bg);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .rating-value {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-color);
      letter-spacing: -0.5px;
    }

    .rating-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .rating-bars {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .rating-item {
      display: grid;
      grid-template-columns: 140px 1fr 40px;
      align-items: center;
      gap: 1rem;
    }

    .rating-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-color);
      font-family: var(--font-sans);
    }

    .rating-bar-container {
      height: 8px;
      background-color: var(--input-bg);
      border-radius: 4px;
      overflow: hidden;
    }

    .rating-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-color), #ff9933);
      border-radius: 4px;
      transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .rating-score {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-color);
      text-align: right;
      font-family: var(--font-sans);
    }

    .rating-radar-view {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem 0;
      width: 100%;
    }

    @media (max-width: 768px) {
      .rating-display {
        border-radius: 10px;
        border: 1px solid var(--border-color);
        padding: 1.25rem 1rem;
        width: 100%;
        margin: 0 auto;
      }

      .rating-header-bar {
        gap: 1rem;
        padding-bottom: 1rem;
      }

      .rating-circle {
        width: 54px;
        height: 54px;
      }

      .rating-inner {
        width: 42px;
        height: 42px;
      }

      .rating-value {
        font-size: 1.1rem;
      }

      .rating-label {
        font-size: 0.75rem;
      }

      .rating-item {
        grid-template-columns: 90px 1fr 30px;
        gap: 0.5rem;
      }

      .rating-name {
        font-size: 0.75rem;
      }

      .rating-score {
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

  viewMode: 'bars' | 'radar' = 'bars';

  getCircleGradient(rating: number): string {
    const percent = (rating / 10) * 100;
    const degrees = (percent / 100) * 360;
    return `conic-gradient(var(--accent-color) 0deg, var(--accent-color) ${degrees}deg, var(--border-color) ${degrees}deg, var(--border-color) 360deg)`;
  }
}
