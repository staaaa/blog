import { Component, OnInit, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService, Review } from '../../core/services/api.service';
import { RatingDisplayComponent } from '../../shared/components/rating-display/rating-display.component';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingDisplayComponent],
  template: `
    <div class="review-container" *ngIf="review">
      <header class="review-header">
        <div class="cover-image" *ngIf="review.coverImage">
          <img [src]="getImageUrl(review.coverImage)" [alt]="review.gameTitle" />
          <div class="cover-overlay"></div>
        </div>

        <div class="header-content">
          <h1 class="game-title">{{ review.gameTitle }}</h1>
          <h2 class="review-title">{{ review.title }}</h2>

          <div class="categories">
            <a
              *ngFor="let genre of review.genres"
              [routerLink]="['/genres', genre.slug]"
              class="category-link"
            >
              {{ genre.name }}
            </a>
            <a
              *ngIf="review.series"
              [routerLink]="['/series', review.series.slug]"
              class="category-link"
            >
              Seria: {{ review.series.name }}
            </a>
            <a
              *ngIf="review.studio"
              [routerLink]="['/studios', review.studio.slug]"
              class="category-link"
            >
              Studio: {{ review.studio.name }}
            </a>
          </div>

          <div class="meta">
            <span class="date">Aktualizacja: {{ review.updatedAt | date: 'dd.MM.yyyy' }}</span>
            <span class="date release" *ngIf="review.releaseDate">Premiera: {{ review.releaseDate | date: 'dd.MM.yyyy' }}</span>
          </div>
        </div>
      </header>

      <section class="review-ratings">
        <app-rating-display
          [averageRating]="review.averageRating"
          [storyRating]="review.storyRating"
          [musicRating]="review.musicRating"
          [graphicsRating]="review.graphicsRating"
          [optimizationRating]="review.optimizationRating"
          [gameplayRating]="review.gameplayRating"
          [customRatings]="review.customRatings"
        ></app-rating-display>
      </section>

      <section class="hardware-specs" *ngIf="review.hardwareSpecs">
        <h3>Specyfikacja sprzętowa</h3>
        <div class="specs-content" [innerHTML]="sanitize(review.hardwareSpecs)"></div>
      </section>

      <section class="review-content">
        <div class="content-body" [innerHTML]="processedContent"></div>
      </section>
    </div>

    <div class="loading" *ngIf="loading">
      <div class="spinner"></div>
      <p>Ładowanie recenzji...</p>
    </div>

    <div class="error" *ngIf="error">
      <p>{{ error }}</p>
    </div>

    <!-- Lightbox -->
    <div class="lightbox" *ngIf="lightboxImage" (click)="closeLightbox()">
      <img [src]="lightboxImage" alt="Powiększony obraz" />
      <button class="lightbox-close">✕</button>
    </div>
  `,
  styles: [
    `
      .review-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 2.5rem 1.5rem;
      }
      .review-header {
        position: relative;
        margin-bottom: 2.5rem;
        border-radius: 12px;
        overflow: hidden;
        background-color: var(--card-bg);
        border: 1px solid var(--border-color);
      }
      .cover-image {
        position: relative;
        width: 100%;
        aspect-ratio: 21 / 9;
      }
      .cover-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .cover-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, var(--card-bg) 0%, transparent 80%);
      }
      .header-content {
        padding: 2rem;
        position: relative;
        margin-top: -60px;
        z-index: 2;
      }
      .game-title {
        font-size: 2.25rem;
        font-weight: 300;
        font-family: var(--font-serif);
        letter-spacing: -0.5px;
        color: var(--text-color);
        margin: 0 0 0.5rem;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
      }
      .review-title {
        font-size: 1.2rem;
        font-weight: 300;
        font-family: var(--font-serif);
        color: var(--text-muted);
        margin: 0 0 1.5rem;
      }
      .categories {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }
      .category-link {
        font-size: 0.95rem;
        font-weight: 500;
        text-decoration: underline;
        color: var(--accent-color);
        transition: color 0.2s ease;
      }
      .category-link:hover {
        color: var(--accent-hover);
      }
      .meta {
        color: var(--text-muted);
        font-size: 0.85rem;
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        border-top: 1px solid var(--border-color);
        padding-top: 1rem;
      }
      .meta .release {
        color: var(--accent-color);
      }
      .review-ratings {
        margin-bottom: 2.5rem;
      }
      .hardware-specs {
        background-color: var(--card-bg);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 2.5rem;
        border: 1px solid var(--border-color);
      }
      .hardware-specs h3 {
        margin: 0 0 1rem;
        color: var(--text-color);
        font-size: 1.15rem;
        font-weight: 300;
        font-family: var(--font-serif);
      }
      .specs-content {
        color: var(--text-color);
        font-size: 0.95rem;
        line-height: 1.6;
      }
      .review-content {
        margin: 0 auto;
        padding: 0;
      }
      .content-body {
        max-width: 100%;
        margin: 0 auto;
        color: var(--text-color);
        font-size: 1.15rem;
        line-height: 1.7;
      }
      :host ::ng-deep .content-body p {
        margin-bottom: 0.4rem;
        line-height: 1.7;
      }
      :host ::ng-deep .content-body p:empty,
      :host ::ng-deep .content-body p:has(br:only-child) {
        min-height: 1.2em;
        margin-bottom: 0.4rem;
      }
      :host ::ng-deep .content-body h1,
      :host ::ng-deep .content-body h2,
      :host ::ng-deep .content-body h3 {
        font-family: var(--font-serif);
        font-weight: 300;
        color: var(--text-color);
        margin: 2rem 0 1rem;
      }
      :host ::ng-deep .content-body img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 2rem 0;
        cursor: zoom-in;
        transition: transform 0.2s ease;
      }
      :host ::ng-deep .content-body img:hover {
        transform: scale(1.01);
      }
      
      /* Spoiler styles */
      :host ::ng-deep .spoiler-box {
        position: relative;
        margin: 1.5rem 0;
        padding: 1.25rem;
        background-color: var(--card-bg);
        border: 1px solid var(--border-color);
        border-left: 3px solid var(--accent-color);
        border-radius: 6px;
        cursor: pointer;
      }
      :host ::ng-deep .spoiler-box .spoiler-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--accent-color);
        font-weight: 600;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.5rem;
      }
      :host ::ng-deep .spoiler-box .spoiler-text {
        filter: blur(15px);
        user-select: none;
        transition: filter 0.3s;
        color: var(--text-color);
      }
      :host ::ng-deep .spoiler-box.revealed .spoiler-text {
        filter: none;
        user-select: auto;
      }
      :host ::ng-deep .spoiler-box.revealed .spoiler-label span:last-child {
        display: none;
      }

      .loading,
      .error {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 6rem 0;
        gap: 1.25rem;
        color: var(--text-muted);
      }
      
      /* Lightbox */
      .lightbox {
        position: fixed;
        inset: 0;
        background: rgba(18, 18, 20, 0.97);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: zoom-out;
        animation: fadeIn 0.2s;
      }
      .lightbox img {
        max-width: 95vw;
        max-height: 95vh;
        object-fit: contain;
        border-radius: 4px;
      }
      .lightbox-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-color);
        font-size: 1.25rem;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: border-color 0.2s ease;
      }
      .lightbox-close:hover {
        border-color: var(--accent-color);
        color: var(--accent-color);
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* Mobile Styles */
      @media (max-width: 768px) {
        .review-container {
          padding: 1rem 0;
        }
        .review-header {
          border-radius: 0;
          border-left: none;
          border-right: none;
        }
        .cover-image {
          aspect-ratio: 16 / 9;
        }
        .header-content {
          padding: 1.5rem 1rem;
          margin-top: -40px;
        }
        .game-title {
          font-size: 1.75rem;
        }
        .review-ratings {
          padding: 0 1rem;
        }
        .hardware-specs {
          border-radius: 0;
          border-left: none;
          border-right: none;
          padding: 1.5rem 1rem;
        }
        .content-body {
          padding: 0 1.25rem; /* Paragrafy rozciągają się na całą szerokość z małym paddingiem */
        }
        .lightbox-close {
          top: 10px;
          right: 10px;
        }
      }
    `,
  ],
})
export class ReviewDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  review: Review | null = null;
  loading = true;
  error = '';
  processedContent: SafeHtml = '';
  lightboxImage: string | null = null;

  private clickHandler = this.handleContentClick.bind(this);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadReview(+id);
  }

  ngAfterViewInit(): void {
    document.addEventListener('click', this.clickHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickHandler);
  }

  loadReview(id: number): void {
    this.api.getReview(id).subscribe({
      next: (review) => {
        this.review = review;
        this.processedContent = this.processContent(review.content);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Nie udało się załadować recenzji';
        this.loading = false;
      },
    });
  }

  getImageUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return url;
    return '/uploads/' + url;
  }

  sanitize(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  processContent(content: string): SafeHtml {
    // Parse [SPOILER]...[/SPOILER] text markers without emojis
    let processed = content.replace(
      /\[SPOILER\]([\s\S]*?)\[\/SPOILER\]/gi,
      `<div class="spoiler-box" data-spoiler="true">
        <div class="spoiler-label">[SPOILER] <span>Kliknij, aby odsłonić treść</span></div>
        <div class="spoiler-text">$1</div>
      </div>`,
    );

    return this.sanitizer.bypassSecurityTrustHtml(processed);
  }

  handleContentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Handle spoiler click
    const spoilerBox = target.closest('.spoiler-box');
    if (spoilerBox) {
      spoilerBox.classList.toggle('revealed');
      return;
    }

    // Handle image click for lightbox
    if (target.tagName === 'IMG' && target.closest('.content-body')) {
      this.lightboxImage = (target as HTMLImageElement).src;
    }
  }

  closeLightbox(): void {
    this.lightboxImage = null;
  }
}
