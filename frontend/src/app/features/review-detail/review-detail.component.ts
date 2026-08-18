import { Component, OnInit, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ApiService, Review } from '../../core/services/api.service';
import { TocService, TocItem } from '../../core/services/toc.service';
import { RatingDisplayComponent } from '../../shared/components/rating-display/rating-display.component';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingDisplayComponent],
  template: `
    <div class="review-page-layout" *ngIf="review">
      <!-- Main Content Column -->
      <div class="review-main-col">
        <div class="review-container">
          <header class="review-header">
            <div class="cover-image" *ngIf="review.coverImage">
              <img [src]="getImageUrl(review.coverImage)" [alt]="review.gameTitle" />
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
                <span class="date release" *ngIf="review.releaseDate"
                  >Premiera: {{ review.releaseDate | date: 'dd.MM.yyyy' }}</span
                >
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
      </div>

      <!-- Desktop Table of Contents Sidebar -->
      <aside class="review-toc-sidebar" *ngIf="tocItems.length > 0">
        <div class="toc-sticky-card">
          <div class="toc-header">
            <svg class="toc-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span class="toc-title">Struktura recenzji</span>
          </div>

          <nav class="toc-nav">
            <ul class="toc-list">
              <li *ngFor="let item of tocItems"
                  class="toc-item"
                  [class.level-1]="item.level === 1"
                  [class.level-2]="item.level === 2"
                  [class.active]="activeTocId === item.id">
                <button type="button" (click)="scrollTo(item.id)" class="toc-link" [title]="item.text">
                  <span class="toc-indicator"></span>
                  <span class="toc-text">{{ item.text }}</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
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
      .review-page-layout {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        max-width: 1380px;
        margin: 0 auto;
        padding: 0 1.5rem;
        gap: 2.5rem;
        position: relative;
      }
      .review-main-col {
        flex: 1;
        max-width: 960px;
        min-width: 0;
      }
      .review-container {
        width: 100%;
        margin: 0 auto;
        padding: 2.5rem 0;
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
        aspect-ratio: 16 / 9;
        overflow: hidden;
        background-color: var(--input-bg);
        border-bottom: 1px solid var(--border-color);
      }
      .cover-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .header-content {
        padding: 2rem;
        position: relative;
      }
      .game-title {
        font-size: 2.25rem;
        font-weight: 300;
        font-family: var(--font-serif);
        letter-spacing: -0.5px;
        color: var(--text-color);
        margin: 0 0 0.5rem;
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

      /* Desktop Table of Contents Sidebar */
      .review-toc-sidebar {
        width: 270px;
        flex-shrink: 0;
        position: sticky;
        top: 95px;
        margin-top: 2.5rem;
        max-height: calc(100vh - 120px);
        overflow-y: auto;
      }
      .toc-sticky-card {
        background-color: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1.25rem 1rem;
        box-shadow: 0 4px 12px var(--shadow);
      }
      .toc-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-bottom: 0.75rem;
        margin-bottom: 0.75rem;
        border-bottom: 1px solid var(--border-color);
        color: var(--text-color);
      }
      .toc-icon {
        color: var(--accent-color);
        flex-shrink: 0;
      }
      .toc-title {
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .toc-nav {
        position: relative;
      }
      .toc-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        position: relative;
      }
      .toc-item {
        position: relative;
      }
      .toc-link {
        width: 100%;
        display: flex;
        align-items: flex-start;
        gap: 0.6rem;
        padding: 0.4rem 0.5rem;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
        border-radius: 6px;
        color: var(--text-muted);
        font-size: 0.85rem;
        font-family: inherit;
        line-height: 1.4;
        transition: all 0.2s ease;
      }
      .toc-link:hover {
        color: var(--text-color);
        background: var(--input-bg);
      }
      .toc-item.level-1 .toc-link {
        font-weight: 700;
        color: var(--text-color);
      }
      .toc-item.level-2 .toc-link {
        padding-left: 1.4rem;
        font-size: 0.82rem;
        color: var(--text-muted);
      }
      .toc-indicator {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--border-color);
        margin-top: 6px;
        flex-shrink: 0;
        transition: all 0.2s ease;
      }
      .toc-item.level-2 .toc-indicator {
        width: 4px;
        height: 4px;
        margin-top: 7px;
      }
      .toc-text {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .toc-item.active .toc-link {
        color: var(--accent-color);
        font-weight: 600;
        background: rgba(255, 122, 0, 0.08);
      }
      .toc-item.active .toc-indicator {
        background: var(--accent-color);
        box-shadow: 0 0 6px var(--accent-color);
        transform: scale(1.2);
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
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      /* Responsive Layout */
      @media (max-width: 1080px) {
        .review-toc-sidebar {
          display: none;
        }
        .review-page-layout {
          display: block;
          padding: 0;
        }
        .review-main-col {
          max-width: 1000px;
          margin: 0 auto;
        }
        .review-container {
          padding: 2.5rem 1.5rem;
        }
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
          margin-top: 0;
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
          padding: 0 1.25rem;
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
  private tocService = inject(TocService);

  review: Review | null = null;
  loading = true;
  error = '';
  processedContent: SafeHtml = '';
  lightboxImage: string | null = null;

  tocItems: TocItem[] = [];
  activeTocId: string | null = null;

  private routeSub?: Subscription;
  private clickHandler = this.handleContentClick.bind(this);
  private scrollHandler = this.handleScroll.bind(this);

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadReview(+id);
      }
    });
  }

  ngAfterViewInit(): void {
    document.addEventListener('click', this.clickHandler);
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    document.removeEventListener('click', this.clickHandler);
    window.removeEventListener('scroll', this.scrollHandler);
    this.tocService.clear();
  }

  loadReview(id: number): void {
    this.loading = true;
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
    // 1. Parse [SPOILER]...[/SPOILER] text markers
    let processed = content.replace(
      /\[SPOILER\]([\s\S]*?)\[\/SPOILER\]/gi,
      `<div class="spoiler-box" data-spoiler="true">
        <div class="spoiler-label">[SPOILER] <span>Kliknij, aby odsłonić treść</span></div>
        <div class="spoiler-text">$1</div>
      </div>`,
    );

    // 2. Extract headings & build TOC structure exclusively from .ql-size-huge and .ql-size-large
    const { processedHtml, items } = this.extractHeadings(processed);
    this.tocItems = items;
    this.tocService.setItems(items);
    if (items.length > 0) {
      this.activeTocId = items[0].id;
    }

    return this.sanitizer.bypassSecurityTrustHtml(processedHtml);
  }

  private extractHeadings(html: string): { processedHtml: string; items: TocItem[] } {
    if (!html) return { processedHtml: '', items: [] };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const items: TocItem[] = [];
    const processedNodes = new Set<Node>();

    // Select only Quill size formatted heading elements (huge = Chapter / Level 1, large = Subchapter / Level 2)
    const candidates = Array.from(
      doc.body.querySelectorAll('.ql-size-huge, .ql-size-large')
    );

    let index = 0;
    for (const el of candidates) {
      // If this element or any of its ancestors was already processed, skip
      let ancestor: HTMLElement | null = el.parentElement;
      let alreadyCovered = false;
      while (ancestor && ancestor !== doc.body) {
        if (processedNodes.has(ancestor)) {
          alreadyCovered = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      if (alreadyCovered) continue;

      const rawText = el.textContent?.trim();
      if (!rawText) continue;

      // Find the closest block container (e.g. <p> or <div>) or el itself
      const blockParent = el.closest('p, div, li, section, article') || (el as HTMLElement);

      // If the blockParent was already processed for another heading, skip to avoid duplicate headings on same line
      if (processedNodes.has(blockParent)) continue;

      processedNodes.add(el);
      processedNodes.add(blockParent);
      index++;

      // Level 1: huge -> Rozdział
      // Level 2: large -> Podrozdział
      const isHuge = el.classList.contains('ql-size-huge');
      const level: 1 | 2 = isHuge ? 1 : 2;

      // If the entire paragraph is a concise heading, use full paragraph text, otherwise use rawText
      const fullText = blockParent.textContent?.trim();
      const headingText = (fullText && fullText.length <= 100) ? fullText : rawText;

      const slug = this.slugify(headingText) || `sekcja-${index}`;
      const id = `toc-${index}-${slug}`;

      // Set anchor ID on the block parent so scrolling lands at the top of the paragraph
      blockParent.id = id;
      blockParent.classList.add('review-heading-anchor');

      items.push({
        id,
        text: headingText,
        level,
      });
    }

    return {
      processedHtml: doc.body.innerHTML,
      items,
    };
  }

  private slugify(text: string): string {
    const polishMap: Record<string, string> = {
      'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
      'Ą': 'a', 'Ć': 'c', 'Ę': 'e', 'Ł': 'l', 'Ń': 'n', 'Ó': 'o', 'Ś': 's', 'Ź': 'z', 'Ż': 'z'
    };
    return text
      .split('')
      .map(char => polishMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
  }

  scrollTo(id: string): void {
    this.activeTocId = id;
    this.tocService.scrollTo(id);
  }

  private handleScroll(): void {
    if (this.tocItems.length === 0) return;
    const offset = 140;
    let currentId: string | null = null;

    for (const item of this.tocItems) {
      const el = document.getElementById(item.id);
      if (el) {
        const top = el.getBoundingClientRect().top;
        if (top <= offset) {
          currentId = item.id;
        } else {
          break;
        }
      }
    }

    if (currentId && currentId !== this.activeTocId) {
      this.activeTocId = currentId;
      this.tocService.setActiveId(currentId);
    }
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
