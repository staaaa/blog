import { Component, OnInit, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService, Review } from '../../core/services/api.service';
import { RatingDisplayComponent } from '../../shared/components/rating-display/rating-display.component';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [CommonModule, RatingDisplayComponent],
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
              [href]="'/genres/' + genre.slug"
              class="category-tag genre"
            >
              {{ genre.name }}
            </a>
            <a
              *ngIf="review.series"
              [href]="'/series/' + review.series.slug"
              class="category-tag series"
            >
              📚 {{ review.series.name }}
            </a>
            <a
              *ngIf="review.studio"
              [href]="'/studios/' + review.studio.slug"
              class="category-tag studio"
            >
              🏢 {{ review.studio.name }}
            </a>
          </div>

          <div class="meta">
            <span class="date">📅 {{ review.createdAt | date: 'dd MMMM yyyy' }}</span>
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
        <h3>🖥️ Specyfikacja sprzętowa</h3>
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
      <span class="error-icon">❌</span>
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
        padding: 2rem;
      }
      .review-header {
        position: relative;
        margin-bottom: 2rem;
        border-radius: 20px;
        overflow: hidden;
        background: linear-gradient(145deg, #1e1e2f 0%, #252538 100%);
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
        background: linear-gradient(to top, rgba(20, 20, 35, 1) 0%, transparent 60%);
      }
      .header-content {
        padding: 2rem;
        position: relative;
        margin-top: -80px;
      }
      .game-title {
        font-size: 2.5rem;
        font-weight: 800;
        color: white;
        margin: 0 0 0.5rem;
        text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
      }
      .review-title {
        font-size: 1.3rem;
        font-weight: 500;
        color: #a0a0c0;
        margin: 0 0 1.5rem;
      }
      .categories {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      .category-tag {
        padding: 0.4rem 0.9rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s ease;
      }
      .category-tag.genre {
        background: rgba(138, 43, 226, 0.2);
        color: #b47cff;
        border: 1px solid rgba(138, 43, 226, 0.3);
      }
      .category-tag.series {
        background: rgba(255, 165, 0, 0.2);
        color: #ffc04d;
        border: 1px solid rgba(255, 165, 0, 0.3);
      }
      .category-tag.studio {
        background: rgba(0, 200, 150, 0.2);
        color: #00d9a5;
        border: 1px solid rgba(0, 200, 150, 0.3);
      }
      .category-tag:hover {
        transform: translateY(-2px);
      }
      .meta {
        color: #666680;
        font-size: 0.9rem;
      }
      .review-ratings {
        margin-bottom: 2rem;
      }
      .hardware-specs {
        background: linear-gradient(145deg, rgba(30, 30, 50, 0.6) 0%, rgba(20, 20, 35, 0.8) 100%);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .hardware-specs h3 {
        margin: 0 0 1rem;
        color: #00d4aa;
        font-size: 1.1rem;
      }
      .specs-content {
        color: #c0c0d0;
        font-size: 0.95rem;
        line-height: 1.6;
      }
      .review-content {
        background: linear-gradient(145deg, rgba(30, 30, 50, 0.5) 0%, rgba(20, 20, 35, 0.7) 100%);
        border-radius: 16px;
        padding: 2rem;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .content-body {
        color: #d0d0e0;
        font-size: 1.05rem;
        line-height: 1.8;
      }
      :host ::ng-deep .content-body p {
        margin-bottom: 1.5rem;
      }
      :host ::ng-deep .content-body img {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
        margin: 1.5rem 0;
        cursor: zoom-in;
        transition: transform 0.2s;
      }
      :host ::ng-deep .content-body img:hover {
        transform: scale(1.02);
      }
      :host ::ng-deep .content-body h2,
      :host ::ng-deep .content-body h3 {
        color: white;
        margin: 2rem 0 1rem;
      }

      /* Spoiler styles */
      :host ::ng-deep .spoiler-box {
        position: relative;
        margin: 1rem 0;
        padding: 1rem;
        background: rgba(255, 165, 0, 0.1);
        border: 1px solid rgba(255, 165, 0, 0.3);
        border-radius: 10px;
        cursor: pointer;
      }
      :host ::ng-deep .spoiler-box .spoiler-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #ffc04d;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }
      :host ::ng-deep .spoiler-box .spoiler-text {
        filter: blur(15px);
        user-select: none;
        transition: filter 0.3s;
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
        padding: 4rem;
        gap: 1rem;
        color: #a0a0c0;
      }
      .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(138, 43, 226, 0.2);
        border-top-color: #8a2be2;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      .error-icon {
        font-size: 3rem;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Lightbox */
      .lightbox {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.95);
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
        border-radius: 8px;
      }
      .lightbox-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        font-size: 1.5rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor: pointer;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
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
    // Parse [SPOILER]...[/SPOILER] text markers
    let processed = content.replace(
      /\[SPOILER\]([\s\S]*?)\[\/SPOILER\]/gi,
      `<div class="spoiler-box" data-spoiler="true">
        <div class="spoiler-label">🔒 <span>Kliknij, aby odsłonić spoiler</span></div>
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
