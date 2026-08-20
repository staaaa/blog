import { Component, OnInit, inject, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ApiService, Review } from '../../core/services/api.service';
import { TocService, TocItem } from '../../core/services/toc.service';
import { RatingDisplayComponent } from '../../shared/components/rating-display/rating-display.component';
import { ProsConsComponent } from '../../shared/components/pros-cons/pros-cons.component';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingDisplayComponent, ProsConsComponent],
  template: `
    <!-- Reading Progress Bar -->
    <div class="reading-progress-bar" [style.width.%]="readingProgress"></div>

    <!-- Zen Mode Floating Status & Exit Bar -->
    <div class="zen-floating-bar" *ngIf="isZenMode">
      <div class="zen-info">
        <span class="zen-dot"></span>
        <span class="zen-title">Tryb skupienia (Zen)</span>
      </div>
      <button type="button" class="zen-exit-btn" (click)="toggleZenMode()" title="Wyjdź z trybu Zen (Esc)">
        <span>Wyjdź z trybu Zen (Esc)</span>
        <span class="zen-exit-icon">✕</span>
      </button>
    </div>

    <div class="review-page-layout" *ngIf="review" [class.zen-active]="isZenMode">
      <!-- Main Content Column -->
      <div class="review-main-col">
        <div class="review-container">
          <header class="review-header">
            <div class="cover-image" *ngIf="review.coverImage">
              <img [src]="getImageUrl(review.coverImage)" [alt]="review.gameTitle" />
            </div>

            <div class="header-content">
              <div class="header-top-row">
                <div class="status-badge" [ngClass]="'status-' + (review.gameStatus || 'main_story')">
                  <span class="status-text">{{ getStatusLabel(review.gameStatus) }}</span>
                </div>
                
                <div class="playtime-badge" *ngIf="review.playtimeHours > 0">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>{{ review.playtimeHours }}h w grze</span>
                </div>

                <!-- Zen Mode Button in Header -->
                <button 
                  type="button" 
                  class="zen-btn" 
                  (click)="toggleZenMode()" 
                  [class.active]="isZenMode"
                  title="Przełącz tryb skupienia (Zen)"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"></circle>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span>{{ isZenMode ? 'Wyłącz Zen' : 'Tryb Zen' }}</span>
                </button>
              </div>

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

              <!-- Platforms -->
              <div class="platforms-row" *ngIf="review.platforms && review.platforms.length > 0">
                <span class="platforms-label">Dostępne na:</span>
                <div class="platform-chips">
                  <ng-container *ngFor="let p of review.platforms">
                    <a *ngIf="p.url" [href]="p.url" target="_blank" rel="noopener noreferrer" class="platform-chip link-chip" [title]="'Kup / Zobacz na ' + p.name">
                      <span>{{ p.name }}</span>
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                    <span *ngIf="!p.url" class="platform-chip static-chip">
                      {{ p.name }}
                    </span>
                  </ng-container>
                </div>
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

          <!-- Pros & Cons Section -->
          <section class="pros-cons-section" *ngIf="(review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0)">
            <app-pros-cons [pros]="review.pros" [cons]="review.cons"></app-pros-cons>
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

      <!-- Desktop Sidebar (TOC + Soundtrack Player) -->
      <aside class="review-toc-sidebar" *ngIf="(tocItems.length > 0 || soundtrackEmbedUrl) && !isZenMode">
        <!-- Table of Contents Card -->
        <div class="toc-sticky-card" *ngIf="tocItems.length > 0">
          <div class="toc-header">
            <div class="toc-header-left">
              <svg class="toc-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              <span class="toc-title">Struktura</span>
            </div>
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

        <!-- Soundtrack / OST Player Card (Under the Menu) -->
        <div class="soundtrack-card" *ngIf="soundtrackEmbedUrl">
          <div class="soundtrack-header">
            <div class="soundtrack-title-row">
              <div class="soundtrack-pulse-icon">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
              </div>
              <span class="soundtrack-title">Ścieżka dźwiękowa</span>
            </div>
            <span class="soundtrack-subtitle">Włącz w tle do czytania</span>
          </div>

          <div class="soundtrack-player-frame">
            <iframe
              [src]="soundtrackEmbedUrl"
              title="Ścieżka dźwiękowa gry"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
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
      /* Reading Progress Bar */
      .reading-progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        height: 3.5px;
        background: var(--accent-color);
        box-shadow: 0 0 10px var(--accent-color);
        z-index: 99999;
        pointer-events: none;
        transition: width 0.05s linear;
      }

      /* Zen Floating Status Bar */
      .zen-floating-bar {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        background: rgba(20, 20, 24, 0.92);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--border-color);
        border-radius: 30px;
        padding: 0.4rem 1.25rem;
        display: flex;
        align-items: center;
        gap: 1.25rem;
        box-shadow: 0 8px 24px var(--shadow);
        animation: slideDown 0.3s ease;
      }
      .zen-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .zen-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent-color);
        box-shadow: 0 0 8px var(--accent-color);
        animation: pulseDot 2s infinite ease-in-out;
      }
      .zen-title {
        font-size: 0.85rem;
        font-family: var(--font-sans);
        color: var(--text-color);
        font-weight: 600;
      }
      .zen-exit-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.25rem 0.65rem;
        background: var(--input-bg);
        border: 1px solid var(--border-color);
        border-radius: 20px;
        color: var(--text-muted);
        font-size: 0.78rem;
        font-family: var(--font-sans);
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .zen-exit-btn:hover {
        color: var(--text-color);
        border-color: var(--accent-color);
      }
      .zen-exit-icon {
        font-size: 0.85rem;
      }

      @keyframes slideDown {
        from { transform: translate(-50%, -20px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }
      @keyframes pulseDot {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.3); }
      }

      .review-page-layout {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        max-width: 1380px;
        margin: 0 auto;
        padding: 0 1.5rem;
        gap: 2.5rem;
        position: relative;
        transition: all 0.3s ease;
      }
      .review-main-col {
        flex: 1;
        max-width: 960px;
        min-width: 0;
        transition: max-width 0.3s ease;
      }
      .review-container {
        width: 100%;
        margin: 0 auto;
        padding: 2.5rem 0;
      }

      /* Zen Mode Activated Layout */
      .review-page-layout.zen-active {
        max-width: 900px;
      }
      .review-page-layout.zen-active .review-main-col {
        max-width: 840px;
        margin: 0 auto;
      }
      .review-page-layout.zen-active .content-body {
        font-size: 1.25rem;
        line-height: 1.85;
      }
      .review-page-layout.zen-active .content-body p {
        margin-bottom: 0.75rem;
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
      .header-top-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.35rem 0.75rem;
        border-radius: 6px;
        font-family: var(--font-sans);
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        border: 1px solid transparent;
      }
      .status-platyna {
        background: rgba(234, 179, 8, 0.15);
        color: #facc15;
        border-color: rgba(234, 179, 8, 0.4);
        box-shadow: 0 0 10px rgba(234, 179, 8, 0.1);
      }
      .status-main_story {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border-color: rgba(16, 185, 129, 0.4);
      }
      .status-in_progress {
        background: rgba(59, 130, 246, 0.15);
        color: #60a5fa;
        border-color: rgba(59, 130, 246, 0.4);
      }
      .status-abandoned {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        border-color: rgba(239, 68, 68, 0.4);
      }
      .playtime-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.75rem;
        border-radius: 6px;
        background: var(--input-bg);
        border: 1px solid var(--border-color);
        color: var(--text-color);
        font-family: var(--font-sans);
        font-size: 0.82rem;
        font-weight: 600;
      }
      .playtime-badge svg {
        color: var(--accent-color);
      }

      .zen-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.75rem;
        border-radius: 6px;
        background: var(--input-bg);
        border: 1px solid var(--border-color);
        color: var(--text-muted);
        font-family: var(--font-sans);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-left: auto;
      }
      .zen-btn:hover {
        color: var(--text-color);
        border-color: var(--accent-color);
      }
      .zen-btn.active {
        background: rgba(255, 122, 0, 0.12);
        color: var(--accent-color);
        border-color: var(--accent-color);
      }

      .platforms-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
        flex-wrap: wrap;
      }
      .platforms-label {
        font-size: 0.82rem;
        font-family: var(--font-sans);
        color: var(--text-muted);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }
      .platform-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .platform-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.25rem 0.65rem;
        background: var(--input-bg);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-size: 0.8rem;
        font-family: var(--font-sans);
        color: var(--text-color);
        font-weight: 500;
        transition: all 0.2s ease;
      }
      .platform-chip.link-chip {
        color: var(--accent-color);
        border-color: rgba(255, 122, 0, 0.35);
        cursor: pointer;
      }
      .platform-chip.link-chip:hover {
        background: rgba(255, 122, 0, 0.1);
        border-color: var(--accent-color);
        transform: translateY(-1px);
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
      .pros-cons-section {
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

      /* Image Comparison Slider inside content */
      :host ::ng-deep .image-comparison-block {
        position: relative;
        width: 100%;
        margin: 2.5rem 0;
        border-radius: 12px;
        overflow: hidden;
        user-select: none;
        -webkit-user-select: none;
        cursor: ew-resize;
        background-color: var(--card-bg);
        border: 1px solid var(--border-color);
        box-shadow: 0 6px 20px var(--shadow);
      }
      :host ::ng-deep .image-comparison-block .comparison-base {
        width: 100%;
        position: relative;
        display: block;
      }
      :host ::ng-deep .image-comparison-block .comparison-base img {
        width: 100%;
        height: auto;
        display: block;
        margin: 0 !important;
        cursor: ew-resize !important;
        pointer-events: none;
        border-radius: 0 !important;
        transform: none !important;
      }
      :host ::ng-deep .image-comparison-block .comparison-overlay {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        pointer-events: none;
      }
      :host ::ng-deep .image-comparison-block .comparison-overlay img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        margin: 0 !important;
        cursor: ew-resize !important;
        pointer-events: none;
        border-radius: 0 !important;
        transform: none !important;
      }
      :host ::ng-deep .image-comparison-block .comparison-badge {
        position: absolute;
        bottom: 16px;
        padding: 0.35rem 0.75rem;
        background: rgba(18, 18, 22, 0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #ffffff;
        font-size: 0.78rem;
        font-weight: 700;
        font-family: var(--font-sans);
        letter-spacing: 0.5px;
        text-transform: uppercase;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        pointer-events: none;
        z-index: 6;
        transition: opacity 0.2s ease, transform 0.2s ease;
        opacity: 1;
        transform: translateY(0);
      }
      :host ::ng-deep .image-comparison-block .badge-before {
        left: 16px;
      }
      :host ::ng-deep .image-comparison-block .badge-after {
        right: 16px;
      }
      :host ::ng-deep .image-comparison-block .comparison-badge.badge-hidden {
        opacity: 0;
        transform: translateY(4px);
      }
      :host ::ng-deep .image-comparison-block .comparison-handle {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 40px;
        margin-left: -20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 10;
      }
      :host ::ng-deep .image-comparison-block .handle-line {
        width: 2px;
        flex: 1;
        background: #ffffff;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
      }
      :host ::ng-deep .image-comparison-block .handle-grip {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--accent-color);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.6), 0 0 0 2px #ffffff;
        cursor: ew-resize;
        transition: transform 0.15s ease;
      }
      :host ::ng-deep .image-comparison-block:hover .handle-grip {
        transform: scale(1.1);
      }

      /* Desktop Sidebar */
      .review-toc-sidebar {
        width: 280px;
        flex-shrink: 0;
        position: sticky;
        top: 95px;
        margin-top: 2.5rem;
        max-height: calc(100vh - 120px);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
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
        justify-content: space-between;
        gap: 0.5rem;
        padding-bottom: 0.75rem;
        margin-bottom: 0.75rem;
        border-bottom: 1px solid var(--border-color);
      }
      .toc-header-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
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

      /* Soundtrack / OST Card */
      .soundtrack-card {
        background-color: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1.25rem 1rem;
        box-shadow: 0 4px 12px var(--shadow);
      }
      .soundtrack-header {
        margin-bottom: 0.85rem;
      }
      .soundtrack-title-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-color);
        margin-bottom: 0.2rem;
      }
      .soundtrack-pulse-icon {
        color: var(--accent-color);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .soundtrack-title {
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-family: var(--font-sans);
      }
      .soundtrack-subtitle {
        font-size: 0.75rem;
        color: var(--text-muted);
        font-family: var(--font-sans);
        display: block;
      }
      .soundtrack-player-frame {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 8px;
        overflow: hidden;
        background-color: var(--input-bg);
        border: 1px solid var(--border-color);
      }
      .soundtrack-player-frame iframe {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
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

  // Reading progress & Zen mode & OST
  readingProgress = 0;
  isZenMode = false;
  soundtrackEmbedUrl: SafeResourceUrl | null = null;

  private activeComparisonBlock: HTMLElement | null = null;

  private routeSub?: Subscription;
  private clickHandler = this.handleContentClick.bind(this);
  private scrollHandler = this.handleScroll.bind(this);
  private pointerDownHandler = this.handlePointerDown.bind(this);
  private pointerMoveHandler = this.handlePointerMove.bind(this);
  private pointerUpHandler = this.handlePointerUp.bind(this);

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.isZenMode) {
        this.isZenMode = false;
      }
      if (this.lightboxImage) {
        this.closeLightbox();
      }
    }
  }

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

    document.addEventListener('mousedown', this.pointerDownHandler as EventListener);
    document.addEventListener('mousemove', this.pointerMoveHandler as EventListener);
    document.addEventListener('mouseup', this.pointerUpHandler as EventListener);

    document.addEventListener('touchstart', this.pointerDownHandler as EventListener, { passive: false });
    document.addEventListener('touchmove', this.pointerMoveHandler as EventListener, { passive: false });
    document.addEventListener('touchend', this.pointerUpHandler as EventListener);
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    document.removeEventListener('click', this.clickHandler);
    window.removeEventListener('scroll', this.scrollHandler);

    document.removeEventListener('mousedown', this.pointerDownHandler as EventListener);
    document.removeEventListener('mousemove', this.pointerMoveHandler as EventListener);
    document.removeEventListener('mouseup', this.pointerUpHandler as EventListener);

    document.removeEventListener('touchstart', this.pointerDownHandler as EventListener);
    document.removeEventListener('touchmove', this.pointerMoveHandler as EventListener);
    document.removeEventListener('touchend', this.pointerUpHandler as EventListener);

    this.tocService.clear();
  }

  loadReview(id: number): void {
    this.loading = true;
    this.api.getReview(id).subscribe({
      next: (review) => {
        this.review = review;
        this.processedContent = this.processContent(review.content);
        this.processSoundtrackUrl(review.soundtrackUrl);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Nie udało się załadować recenzji';
        this.loading = false;
      },
    });
  }

  toggleZenMode(): void {
    this.isZenMode = !this.isZenMode;
  }

  private processSoundtrackUrl(url: string | null | undefined): void {
    if (!url) {
      this.soundtrackEmbedUrl = null;
      return;
    }

    const videoId = this.extractYouTubeId(url);
    if (videoId) {
      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&rel=0`;
      this.soundtrackEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else {
      this.soundtrackEmbedUrl = null;
    }
  }

  private extractYouTubeId(url: string): string | null {
    const regExp = /(?:https?:\/\/)?(?:www\.|music\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match && match[1] ? match[1] : null;
  }

  getImageUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return url;
    return '/uploads/' + url;
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'platyna':
        return 'Platyna (100%)';
      case 'main_story':
        return 'Główny wątek';
      case 'in_progress':
        return 'W trakcie';
      case 'abandoned':
        return 'Porzucona';
      default:
        return 'Główny wątek';
    }
  }

  getStatusIcon(status?: string): string {
    switch (status) {
      case 'platyna':
        return '🏆';
      case 'main_story':
        return '🎯';
      case 'in_progress':
        return '⏳';
      case 'abandoned':
        return '🛑';
      default:
        return '🎮';
    }
  }

  sanitize(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  processContent(content: string): SafeHtml {
    if (!content) return '';

    // 1. Parse [SPOILER]...[/SPOILER] text markers
    let processed = content.replace(
      /\[SPOILER\]([\s\S]*?)\[\/SPOILER\]/gi,
      `<div class="spoiler-box" data-spoiler="true">
        <div class="spoiler-label">[SPOILER] <span>Kliknij, aby odsłonić treść</span></div>
        <div class="spoiler-text">$1</div>
      </div>`,
    );

    // 2. Parse [COMPARE before="..." after="..." labelBefore="..." labelAfter="..."]
    processed = processed.replace(
      /\[COMPARE\s+before=["']([^"']+)["']\s+after=["']([^"']+)["'](?:\s+labelBefore=["']([^"']*)["'])?(?:\s+labelAfter=["']([^"']*)["'])?\s*\]/gi,
      (_match, before, after, labelBefore, labelAfter) => {
        const lblB = labelBefore || 'Przed';
        const lblA = labelAfter || 'Po';
        const urlB = this.getImageUrl(before);
        const urlA = this.getImageUrl(after);
        return `
          <div class="image-comparison-block" data-comparison="true">
            <!-- Base Image (After image underneath - right side) -->
            <div class="comparison-base">
              <img src="${urlA}" alt="${lblA}" draggable="false" />
            </div>
            <!-- Overlay Image (Before image on top - left side) -->
            <div class="comparison-overlay" style="clip-path: inset(0 50% 0 0);">
              <img src="${urlB}" alt="${lblB}" draggable="false" />
            </div>
            <!-- Floating Badges -->
            <span class="comparison-badge badge-before">${lblB}</span>
            <span class="comparison-badge badge-after">${lblA}</span>
            <!-- Handle -->
            <div class="comparison-handle" style="left: 50%;">
              <div class="handle-line"></div>
              <div class="handle-grip">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
              <div class="handle-line"></div>
            </div>
          </div>
        `;
      }
    );

    // 3. Extract headings & build TOC structure exclusively from .ql-size-huge and .ql-size-large
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
    // 1. Calculate reading progress
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollTotal > 0) {
      this.readingProgress = Math.min(100, Math.max(0, (window.scrollY / scrollTotal) * 100));
    } else {
      this.readingProgress = 0;
    }

    // 2. Active TOC heading detection
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

  private handlePointerDown(event: MouseEvent | TouchEvent): void {
    const target = event.target as HTMLElement;
    const block = target.closest('.image-comparison-block') as HTMLElement;
    if (block) {
      this.activeComparisonBlock = block;
      this.updateComparisonPosition(block, event);
      if (event.cancelable) {
        event.preventDefault();
      }
    }
  }

  private handlePointerMove(event: MouseEvent | TouchEvent): void {
    if (!this.activeComparisonBlock) return;
    this.updateComparisonPosition(this.activeComparisonBlock, event);
    if (event.cancelable) {
      event.preventDefault();
    }
  }

  private handlePointerUp(): void {
    this.activeComparisonBlock = null;
  }

  private updateComparisonPosition(block: HTMLElement, event: MouseEvent | TouchEvent): void {
    const rect = block.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));

    const overlay = block.querySelector('.comparison-overlay') as HTMLElement;
    const handle = block.querySelector('.comparison-handle') as HTMLElement;
    const badgeBefore = block.querySelector('.badge-before') as HTMLElement;
    const badgeAfter = block.querySelector('.badge-after') as HTMLElement;

    if (overlay) {
      overlay.style.clipPath = `inset(0 ${(100 - percentage).toFixed(2)}% 0 0)`;
    }
    if (handle) {
      handle.style.left = `${percentage.toFixed(2)}%`;
    }
    if (badgeBefore) {
      if (percentage <= 8) {
        badgeBefore.classList.add('badge-hidden');
      } else {
        badgeBefore.classList.remove('badge-hidden');
      }
    }
    if (badgeAfter) {
      if (percentage >= 92) {
        badgeAfter.classList.add('badge-hidden');
      } else {
        badgeAfter.classList.remove('badge-hidden');
      }
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

    // Ignore image clicks inside image comparisons
    if (target.closest('.image-comparison-block')) {
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
