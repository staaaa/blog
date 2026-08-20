import { Component, OnInit, inject, AfterViewInit, OnDestroy, HostListener, PLATFORM_ID } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl, Meta, Title } from '@angular/platform-browser';
import { ApiService, Game, Review, ReviewerSummary, GameAverages, Comment as ReviewComment } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { TocService, TocItem } from '../../core/services/toc.service';
import { RatingDisplayComponent } from '../../shared/components/rating-display/rating-display.component';
import { ProsConsComponent } from '../../shared/components/pros-cons/pros-cons.component';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RatingDisplayComponent, ProsConsComponent],
  template: `
    <!-- Reading Progress Bar -->
    <div class="reading-progress-bar" [style.width.%]="readingProgress"></div>

    <!-- Zen Mode Floating Status & Exit Bar -->
    <div class="zen-floating-bar" *ngIf="isZenMode">
      <div class="zen-info">
        <span class="zen-dot"></span>
        <span class="zen-title">
          <span class="zen-desktop-text">Tryb skupienia (Zen)</span>
          <span class="zen-mobile-text">Tryb Zen</span>
        </span>
      </div>
      <button type="button" class="zen-exit-btn" (click)="toggleZenMode()" title="Wyjdź z trybu Zen (Esc)">
        <span class="zen-desktop-text">Wyjdź (Esc)</span>
        <span class="zen-mobile-text">Wyjdź</span>
        <span class="zen-exit-icon">✕</span>
      </button>
    </div>

    <div class="game-page-layout" *ngIf="game" [class.zen-active]="isZenMode">
      <!-- Main Content Column -->
      <div class="game-main-col">
        <div class="game-container">
          <!-- Game Header -->
          <header class="game-header">
            <div class="cover-image" *ngIf="game.coverImage">
              <img [src]="getImageUrl(game.coverImage)" [alt]="game.gameTitle" />
            </div>

            <div class="header-content">
              <div class="header-top-row">
                <div class="header-top-left">
                  <!-- Overall Game Score Badge -->
                  <div class="overall-score-badge" *ngIf="averages && averages.reviewCount > 0" title="Średnia ocen recenzentów">
                    <span class="score-val">{{ averages.averageRating | number:'1.1-1' }}</span>
                    <span class="score-max">/10</span>
                    <span class="score-count">({{ averages.reviewCount }} {{ averages.reviewCount === 1 ? 'recenzja' : 'recenzje' }})</span>
                  </div>

                  <!-- Reading Time -->
                  <span class="reading-time" *ngIf="readingTimeMinutes > 0" title="Szacowany czas czytania recenzji">
                    Czas czytania: {{ readingTimeMinutes }} min
                  </span>
                </div>

                <div class="header-actions">
                  <!-- Favorite Heart Button (Reader/Reviewer/Admin) -->
                  <button
                    *ngIf="authService.isAuthenticated()"
                    type="button"
                    class="fav-btn"
                    [class.active]="isFavorite"
                    (click)="toggleFavorite()"
                    [title]="isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'"
                    aria-label="Dodaj do ulubionych"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" [attr.fill]="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>

                  <a
                    *ngIf="!authService.isAuthenticated()"
                    routerLink="/admin/login"
                    class="fav-btn"
                    title="Dodaj do ulubionych"
                    aria-label="Dodaj do ulubionych"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </a>

                  <!-- Zen Mode Button -->
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
              </div>

              <h1 class="game-title">{{ game.gameTitle }}</h1>

              <div class="categories">
                <a
                  *ngFor="let genre of game.genres"
                  [routerLink]="['/genres', genre.slug]"
                  class="category-link"
                >
                  {{ genre.name }}
                </a>
                <a
                  *ngIf="game.series"
                  [routerLink]="['/series', game.series.slug]"
                  class="category-link"
                >
                  Seria: {{ game.series.name }}
                </a>
                <a
                  *ngIf="game.studio"
                  [routerLink]="['/studios', game.studio.slug]"
                  class="category-link"
                >
                  Studio: {{ game.studio.name }}
                </a>
              </div>

              <!-- Platforms -->
              <div class="platforms-row" *ngIf="game.platforms && game.platforms.length > 0">
                <span class="platforms-label">Dostępne na:</span>
                <div class="platform-chips">
                  <ng-container *ngFor="let p of game.platforms">
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
                <span class="date release" *ngIf="game.releaseDate">
                  Premiera gry: {{ game.releaseDate | date: 'dd.MM.yyyy' }}
                </span>
                <span class="date" *ngIf="selectedReview">
                  Ostatnia aktualizacja recenzji: {{ selectedReview.updatedAt | date: 'dd.MM.yyyy' }}
                </span>
              </div>
            </div>
          </header>

          <!-- Reviewers Switcher Bar -->
          <section class="reviewers-section" *ngIf="reviewers && reviewers.length > 0">
            <div class="reviewers-header">
              <span class="reviewers-section-title">
                Recenzenci tej gry ({{ reviewers.length }}):
              </span>

              <!-- Write a review button for reviewer/admin if hasn't reviewed yet -->
              <a
                *ngIf="authService.isReviewer() && !hasUserReviewed()"
                [routerLink]="['/admin/review/new', game.id]"
                class="write-review-btn"
              >
                + Napisz swoją recenzję
              </a>
            </div>

            <div class="reviewers-chips">
              <button
                *ngFor="let rev of reviewers"
                type="button"
                class="reviewer-tab-btn"
                [class.active]="selectedReview && selectedReview.userId === rev.userId"
                (click)="selectReviewer(rev.userId)"
              >
                <div class="reviewer-avatar">
                  <img *ngIf="rev.avatarUrl" [src]="getImageUrl(rev.avatarUrl)" [alt]="rev.displayName" />
                  <span *ngIf="!rev.avatarUrl" class="avatar-fallback">{{ (rev.displayName || 'R')[0].toUpperCase() }}</span>
                </div>
                <div class="reviewer-tab-info">
                  <span class="reviewer-tab-name">{{ rev.displayName }}</span>
                  <span class="reviewer-tab-score">Ocena: {{ rev.averageRating | number:'1.1-1' }}</span>
                </div>
                <span class="draft-chip" *ngIf="rev.isDraft">Szkic</span>
              </button>
            </div>
          </section>

          <!-- Selected Review Content Section -->
          <main class="review-body-section" *ngIf="selectedReview">
            <!-- Review Title & Author Subheader -->
            <div class="review-title-box">
              <div class="review-badges-row">
                <div class="status-badge" [ngClass]="'status-' + (selectedReview.gameStatus || 'main_story')">
                  <span class="status-text">{{ getStatusLabel(selectedReview.gameStatus) }}</span>
                </div>

                <div class="playtime-badge" *ngIf="selectedReview.playtimeHours > 0">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>{{ selectedReview.playtimeHours }}h w grze</span>
                </div>
              </div>

              <h2 class="review-title">{{ selectedReview.title }}</h2>
              <div class="review-byline">
                Autor recenzji: <strong>{{ selectedReview.author?.displayName || selectedReview.author?.username || 'Anonim' }}</strong>
                · {{ selectedReview.updatedAt | date: 'dd.MM.yyyy, HH:mm' }}
              </div>
            </div>

            <!-- Ratings Breakdown & Radar Chart -->
            <section class="review-ratings">
              <app-rating-display
                [averageRating]="selectedReview.averageRating"
                [storyRating]="selectedReview.storyRating"
                [musicRating]="selectedReview.musicRating"
                [graphicsRating]="selectedReview.graphicsRating"
                [optimizationRating]="selectedReview.optimizationRating"
                [gameplayRating]="selectedReview.gameplayRating"
                [customRatings]="selectedReview.customRatings"
              ></app-rating-display>
            </section>

            <!-- Pros & Cons Section -->
            <section class="pros-cons-section" *ngIf="(selectedReview.pros && selectedReview.pros.length > 0) || (selectedReview.cons && selectedReview.cons.length > 0)">
              <app-pros-cons [pros]="selectedReview.pros" [cons]="selectedReview.cons"></app-pros-cons>
            </section>

            <!-- Hardware Specs -->
            <section class="hardware-specs" *ngIf="selectedReview.hardwareSpecs">
              <h3>Specyfikacja sprzętowa recenzenta</h3>
              <div class="specs-content" [innerHTML]="sanitize(selectedReview.hardwareSpecs)"></div>
            </section>

            <!-- Quill Review Content (with Spoilers and Comparison Slider) -->
            <section class="review-content">
              <div class="content-body" (click)="handleContentClick($event)" [innerHTML]="processedContent"></div>
            </section>

            <!-- Author Signature Box at bottom -->
            <footer class="author-signature-card" *ngIf="selectedReview.author">
              <div class="signature-avatar">
                <img *ngIf="selectedReview.author.avatarUrl" [src]="getImageUrl(selectedReview.author.avatarUrl)" [alt]="selectedReview.author.displayName" />
                <span *ngIf="!selectedReview.author.avatarUrl" class="signature-avatar-fallback">
                  {{ (selectedReview.author.displayName || selectedReview.author.username || 'R')[0].toUpperCase() }}
                </span>
              </div>
              <div class="signature-info">
                <div class="signature-top">
                  <span class="signature-name">{{ selectedReview.author.displayName || selectedReview.author.username }}</span>
                  <span class="signature-badge" [class.badge-admin]="selectedReview.author.role === 'admin'">
                    {{ selectedReview.author.role === 'admin' ? 'Administrator' : 'Recenzent' }}
                  </span>
                </div>
                <p class="signature-desc">
                  Recenzja ukończona po {{ selectedReview.playtimeHours || 0 }} godzinach rozgrywki (Status: {{ getStatusLabel(selectedReview.gameStatus) }}).
                </p>
              </div>
            </footer>

            <!-- Comments Section (with id="komentarze" for Table of Contents) -->
            <section id="komentarze" class="comments-section">
              <div class="comments-header">
                <h3 class="comments-title">Komentarze ({{ comments.length }})</h3>
              </div>

              <!-- Add comment box for logged-in user -->
              <div class="add-comment-card" *ngIf="authService.isAuthenticated()">
                <div class="comment-author-bar">
                  <div class="comment-avatar-mini">
                    <img *ngIf="authService.avatarUrl()" [src]="getImageUrl(authService.avatarUrl())" [alt]="authService.displayName()">
                    <span *ngIf="!authService.avatarUrl()">{{ (authService.displayName() || 'U')[0].toUpperCase() }}</span>
                  </div>
                  <span class="comment-author-label">Dodaj komentarz jako <strong>{{ authService.displayName() }}</strong>:</span>
                </div>

                <textarea
                  [(ngModel)]="newCommentText"
                  name="newComment"
                  rows="3"
                  class="comment-textarea"
                  placeholder="Podziel się swoją opinią o grze lub recenzji..."
                  maxlength="2000"
                ></textarea>

                <div class="comment-form-actions">
                  <span class="comment-char-count">{{ 2000 - newCommentText.length }} znaków</span>
                  <button
                    type="button"
                    (click)="submitComment()"
                    [disabled]="submittingComment || !newCommentText.trim()"
                    class="btn-submit-comment"
                  >
                    {{ submittingComment ? 'Dodawanie...' : 'Dodaj komentarz' }}
                  </button>
                </div>
              </div>

              <!-- Notice for guests -->
              <div class="guest-comment-box" *ngIf="!authService.isAuthenticated()">
                <p>
                  <a routerLink="/admin/login">Zaloguj się</a> lub <a routerLink="/register">zarejestruj konto</a>, aby dodać komentarz.
                </p>
              </div>

              <!-- Comments List -->
              <div class="comments-list" *ngIf="comments.length > 0">
                <div class="comment-item" *ngFor="let c of comments">
                  <div class="comment-meta-row">
                    <div class="comment-author-info">
                      <div class="comment-avatar">
                        <img *ngIf="c.author?.avatarUrl" [src]="getImageUrl(c.author?.avatarUrl)" [alt]="c.author?.displayName || c.author?.username">
                        <span *ngIf="!c.author?.avatarUrl">{{ (c.author?.displayName || c.author?.username || 'U')[0].toUpperCase() }}</span>
                      </div>
                      <div class="comment-author-text">
                        <div class="comment-name-row">
                          <span class="comment-name">{{ c.author?.displayName || c.author?.username || 'Użytkownik' }}</span>
                          <span class="comment-role-pill" *ngIf="c.author?.role !== 'reader'" [class.admin-pill]="c.author?.role === 'admin'">
                            {{ c.author?.role === 'admin' ? 'Administrator' : 'Recenzent' }}
                          </span>
                        </div>
                        <span class="comment-timestamp">{{ c.createdAt | date:'dd.MM.yyyy, HH:mm' }}</span>
                      </div>
                    </div>

                    <!-- Delete button for author or admin -->
                    <button
                      *ngIf="canDeleteComment(c)"
                      type="button"
                      (click)="deleteComment(c.id)"
                      class="btn-delete-comment"
                      title="Usuń komentarz"
                    >
                      Usuń
                    </button>
                  </div>

                  <div class="comment-content-text">
                    {{ c.content }}
                  </div>
                </div>
              </div>

              <div class="empty-comments-state" *ngIf="comments.length === 0">
                <p>Brak komentarzy pod tą recenzją. Bądź pierwszym komentującym!</p>
              </div>
            </section>
          </main>

          <!-- No reviews notice -->
          <div class="no-reviews-box" *ngIf="!selectedReview && (!reviewers || reviewers.length === 0)">
            <p>Ta gra nie posiada jeszcze żadnych opublikowanych recenzji.</p>
            <a *ngIf="authService.isReviewer()" [routerLink]="['/admin/review/new', game.id]" class="write-first-review-btn">
              Bądź pierwszym, który napisze recenzję
            </a>
          </div>
        </div>
      </div>

      <!-- Desktop Sidebar (TOC + Soundtrack Player) -->
      <aside class="game-toc-sidebar" *ngIf="(tocItems.length > 0 || soundtrackEmbedUrl) && !isZenMode">
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
              <span class="toc-title">Struktura recenzji</span>
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

        <!-- Soundtrack / OST Player Card -->
        <div class="soundtrack-card" *ngIf="soundtrackEmbedUrl">
          <div class="soundtrack-header">
            <div class="soundtrack-title-row">
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
      <p>Ładowanie gry i recenzji...</p>
    </div>

    <div class="error" *ngIf="error">
      <p>{{ error }}</p>
      <a routerLink="/" class="back-home-btn">Wróć do strony głównej</a>
    </div>

    <!-- Lightbox -->
    <div class="lightbox" *ngIf="lightboxImage" (click)="closeLightbox()">
      <img [src]="lightboxImage" alt="Powiększony obraz" />
      <button class="lightbox-close">✕</button>
    </div>
  `,
  styles: [`
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

    /* Zen Floating Bar */
    .zen-floating-bar {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
      background: rgba(18, 18, 22, 0.94);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--accent-color);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(255, 107, 44, 0.25);
      padding: 0.5rem 1.15rem;
      border-radius: 9999px;
      animation: zenSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
      flex-wrap: nowrap;
      user-select: none;
    }

    @keyframes zenSlideDown {
      from { transform: translate(-50%, -100%); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }

    .zen-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .zen-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-color);
      box-shadow: 0 0 8px var(--accent-color);
      animation: zenPulse 2s infinite ease-in-out;
    }

    @keyframes zenPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }

    .zen-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: #ffffff;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }

    .zen-mobile-text {
      display: none;
    }

    .zen-desktop-text {
      display: inline;
    }

    .zen-exit-btn {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.22);
      color: #ffffff;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }

    .zen-exit-btn:hover {
      background: var(--accent-color);
      border-color: var(--accent-color);
      transform: scale(1.03);
    }

    /* Layout */
    .game-page-layout {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      display: flex;
      gap: 2.5rem;
      align-items: flex-start;
      position: relative;
    }

    .game-main-col {
      flex: 1;
      min-width: 0;
      width: 100%;
    }

    .game-container {
      background-color: var(--card-bg);
      border-radius: 16px;
      padding: 2.5rem;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 20px var(--shadow);
    }

    /* ========================================================
       Zen Active Mode (Subdued, Grayscale UI, Compact Non-Content, Hidden Likes)
       ======================================================== */
    .game-page-layout.zen-active {
      max-width: 820px;
      padding-top: 4.5rem;
    }

    .game-page-layout.zen-active .game-toc-sidebar {
      display: none !important;
    }

    .game-page-layout.zen-active .game-container {
      background: transparent;
      border: none;
      box-shadow: none;
      padding: 0;
    }

    /* Subdued & Compact Header */
    .game-page-layout.zen-active .game-header {
      margin-bottom: 1.5rem;
    }

    .game-page-layout.zen-active .cover-image {
      max-height: 220px;
      margin-bottom: 1rem;
      border-radius: 8px;
      filter: grayscale(0.7) brightness(0.9);
      opacity: 0.85;
      transition: all 0.3s ease;
    }

    .game-page-layout.zen-active .game-title {
      font-size: 1.65rem;
      margin-bottom: 0.4rem;
      opacity: 0.9;
    }

    .game-page-layout.zen-active .overall-score-badge {
      padding: 0.25rem 0.65rem;
      font-size: 0.75rem;
      filter: grayscale(1);
      opacity: 0.7;
      border-color: var(--border-color);
      background: var(--bg-color);
    }

    .game-page-layout.zen-active .overall-score-badge .score-val {
      font-size: 0.95rem;
    }

    .game-page-layout.zen-active .reading-time {
      font-size: 0.75rem;
      opacity: 0.7;
    }

    .game-page-layout.zen-active .categories {
      gap: 0.35rem;
      margin-bottom: 0.75rem;
    }

    .game-page-layout.zen-active .category-link {
      padding: 0.2rem 0.5rem;
      font-size: 0.75rem;
      filter: grayscale(1);
      opacity: 0.75;
    }

    .game-page-layout.zen-active .platforms-row {
      margin-bottom: 0.75rem;
      gap: 0.4rem;
    }

    .game-page-layout.zen-active .platform-chip {
      padding: 0.15rem 0.5rem;
      font-size: 0.72rem;
      filter: grayscale(1);
      opacity: 0.75;
    }

    .game-page-layout.zen-active .meta {
      font-size: 0.75rem;
      opacity: 0.7;
    }

    .game-page-layout.zen-active .header-actions .fav-btn {
      width: 32px;
      height: 32px;
      filter: grayscale(1);
      opacity: 0.75;
    }

    /* Subdued Reviewers Bar */
    .game-page-layout.zen-active .reviewers-section {
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;
      border-radius: 8px;
      filter: grayscale(1);
      opacity: 0.75;
    }

    .game-page-layout.zen-active .reviewers-section-title {
      font-size: 0.8rem;
    }

    .game-page-layout.zen-active .reviewer-tab-btn {
      padding: 0.3rem 0.6rem;
      gap: 0.45rem;
      font-size: 0.75rem;
    }

    .game-page-layout.zen-active .reviewer-avatar {
      width: 22px;
      height: 22px;
      font-size: 0.65rem;
    }

    .game-page-layout.zen-active .review-title-box {
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }

    .game-page-layout.zen-active .review-title {
      font-size: 1.4rem;
      margin-bottom: 0.3rem;
    }

    .game-page-layout.zen-active .review-byline {
      font-size: 0.78rem;
      opacity: 0.75;
    }

    .game-page-layout.zen-active .status-badge,
    .game-page-layout.zen-active .playtime-badge {
      font-size: 0.72rem;
      padding: 0.2rem 0.5rem;
      filter: grayscale(1);
      opacity: 0.75;
    }

    /* Subdued Ratings & Pros/Cons */
    .game-page-layout.zen-active .review-ratings {
      margin-bottom: 1.25rem;
      filter: grayscale(1);
      opacity: 0.75;
      width: 100%;
      margin-left: auto;
      margin-right: auto;
    }

    .game-page-layout.zen-active .pros-cons-section {
      margin-bottom: 1.5rem;
      filter: grayscale(1);
      opacity: 0.75;
      width: 100%;
      margin-left: auto;
      margin-right: auto;
    }

    .game-page-layout.zen-active .hardware-specs {
      padding: 0.85rem 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.82rem;
      filter: grayscale(1);
      opacity: 0.75;
    }

    .game-page-layout.zen-active .author-signature-card {
      padding: 1rem 1.2rem;
      gap: 1rem;
      margin-top: 2rem;
      margin-bottom: 2rem;
      filter: grayscale(1);
      opacity: 0.75;
    }

    .game-page-layout.zen-active .author-signature-card .signature-avatar {
      width: 42px;
      height: 42px;
      font-size: 1rem;
    }

    .game-page-layout.zen-active .comments-section {
      padding-top: 1.5rem;
      margin-top: 1.5rem;
      filter: grayscale(1);
      opacity: 0.8;
      font-size: 0.88rem;
    }

    /* High Focus, Highly Legible Reading Body */
    .game-page-layout.zen-active .content-body {
      font-size: 1.22rem;
      line-height: 1.9;
      color: var(--text-primary);
      filter: none !important;
      opacity: 1 !important;
    }

    .game-page-layout.zen-active .content-body p {
      margin-bottom: 1.4rem;
    }

    /* Game Header */
    .game-header {
      margin-bottom: 2rem;
    }

    .cover-image {
      width: 100%;
      max-height: 480px;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 1.75rem;
      background-color: var(--bg-color);
    }

    .cover-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .header-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .header-top-left {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
    }

    .reading-time {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
      letter-spacing: 0.2px;
    }

    .overall-score-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.45rem 1rem;
      background: linear-gradient(135deg, rgba(255, 107, 44, 0.15), rgba(255, 107, 44, 0.05));
      border: 1px solid var(--accent-color);
      border-radius: 9999px;
      font-weight: 800;
    }

    .score-val {
      color: var(--text-primary);
      font-size: 1.25rem;
    }

    .score-max {
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .score-count {
      color: var(--text-muted);
      font-size: 0.8rem;
      margin-left: 0.25rem;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .fav-btn, .zen-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
    }

    .fav-btn {
      width: 36px;
      height: 36px;
      padding: 0;
      flex-shrink: 0;
    }

    .zen-btn {
      padding: 0.45rem 0.9rem;
    }

    .fav-btn:hover {
      border-color: #ef4444;
      color: #ef4444;
      transform: translateY(-1px);
    }

    .fav-btn.active {
      background: rgba(239, 68, 68, 0.12);
      border-color: #ef4444;
      color: #ef4444;
    }

    .zen-btn:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
      transform: translateY(-1px);
    }

    .zen-btn.active {
      background: rgba(255, 107, 44, 0.15);
      border-color: var(--accent-color);
      color: var(--accent-color);
    }

    .game-title {
      font-size: 2.35rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 0.75rem 0;
      line-height: 1.2;
    }

    .categories {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }

    .category-link {
      padding: 0.3rem 0.75rem;
      background-color: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .category-link:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
      transform: translateY(-1px);
    }

    .platforms-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.6rem;
      margin-bottom: 1.25rem;
    }

    .platforms-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .platform-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }

    .platform-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
    }

    .static-chip {
      background: var(--bg-color);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }

    .link-chip {
      background: rgba(255, 107, 44, 0.08);
      color: var(--accent-color);
      border: 1px solid rgba(255, 107, 44, 0.25);
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .link-chip:hover {
      background: var(--accent-color);
      color: #ffffff;
      transform: translateY(-1px);
    }

    .meta {
      display: flex;
      gap: 1.5rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      flex-wrap: wrap;
    }

    /* Reviewers Bar */
    .reviewers-section {
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 2rem;
    }

    .reviewers-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .reviewers-section-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .write-review-btn {
      display: inline-flex;
      align-items: center;
      padding: 0.4rem 0.85rem;
      background: var(--accent-color);
      color: #ffffff;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .write-review-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .reviewers-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .reviewer-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.45rem 0.85rem;
      background: var(--card-bg);
      border: 1.5px solid var(--border-color);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--text-primary);
    }

    .reviewer-tab-btn:hover {
      border-color: var(--accent-color);
      transform: translateY(-1px);
    }

    .reviewer-tab-btn.active {
      border-color: var(--accent-color);
      background: rgba(255, 107, 44, 0.08);
      box-shadow: 0 0 0 1px var(--accent-color);
    }

    .reviewer-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--accent-color);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.75rem;
    }

    .reviewer-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .reviewer-tab-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
    }

    .reviewer-tab-name {
      font-size: 0.85rem;
      font-weight: 700;
    }

    .reviewer-tab-score {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--accent-color);
    }

    .draft-chip {
      font-size: 0.68rem;
      padding: 0.15rem 0.45rem;
      background: #f59e0b;
      color: #000000;
      font-weight: 700;
      border-radius: 4px;
      text-transform: uppercase;
    }

    /* Review Title Box */
    .review-title-box {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }

    .review-badges-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-platyna { background: rgba(250, 204, 21, 0.15); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.3); }
    .status-main_story { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
    .status-in_progress { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
    .status-abandoned { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }

    .playtime-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.75rem;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .review-title {
      font-size: 1.65rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .review-byline {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .review-byline strong {
      color: var(--text-primary);
    }

    /* Ratings & Pros/Cons */
    .review-ratings {
      margin-bottom: 2rem;
    }

    .pros-cons-section {
      margin-bottom: 2.5rem;
    }

    .hardware-specs {
      margin-bottom: 2.5rem;
      padding: 1.5rem;
      background-color: var(--bg-color);
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }

    .hardware-specs h3 {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0 0 0.75rem 0;
      color: var(--text-primary);
    }

    .specs-content {
      color: var(--text-secondary);
      font-size: 0.92rem;
      line-height: 1.6;
    }

    /* Review Content */
    .review-content {
      margin-bottom: 3rem;
    }

    .content-body {
      color: var(--text-primary);
      font-size: 1.05rem;
      line-height: 1.75;
    }

    /* Author signature */
    .author-signature-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.5rem;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      margin-top: 3rem;
      margin-bottom: 3rem;
    }

    .signature-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--accent-color);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      font-weight: 800;
      flex-shrink: 0;
    }

    .signature-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .signature-info {
      flex: 1;
    }

    .signature-top {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.35rem;
    }

    .signature-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .signature-badge {
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      background: rgba(255, 107, 44, 0.15);
      color: var(--accent-color);
      font-weight: 700;
      text-transform: uppercase;
    }

    .signature-badge.badge-admin {
      background: rgba(139, 92, 246, 0.15);
      color: #8b5cf6;
    }

    .signature-desc {
      margin: 0;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    /* Comments Section */
    .comments-section {
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
      margin-top: 2rem;
    }

    .comments-header {
      margin-bottom: 1.5rem;
    }

    .comments-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }

    .add-comment-card {
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 2rem;
    }

    .comment-author-bar {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      margin-bottom: 0.75rem;
    }

    .comment-avatar-mini {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--accent-color);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.75rem;
    }

    .comment-avatar-mini img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .comment-author-label {
      font-size: 0.88rem;
      color: var(--text-secondary);
    }

    .comment-author-label strong {
      color: var(--text-primary);
    }

    .comment-textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 0.95rem;
      font-family: inherit;
      resize: vertical;
      min-height: 85px;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
    }

    .comment-textarea:focus {
      border-color: var(--accent-color);
    }

    .comment-form-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.75rem;
    }

    .comment-char-count {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .btn-submit-comment {
      padding: 0.55rem 1.25rem;
      background: var(--accent-color);
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-submit-comment:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .btn-submit-comment:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .guest-comment-box {
      background: var(--bg-color);
      border: 1px dashed var(--border-color);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      text-align: center;
      margin-bottom: 2rem;
    }

    .guest-comment-box p {
      margin: 0;
      font-size: 0.92rem;
      color: var(--text-muted);
    }

    .guest-comment-box a {
      color: var(--accent-color);
      font-weight: 600;
      text-decoration: none;
    }

    .guest-comment-box a:hover {
      text-decoration: underline;
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .comment-item {
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .comment-meta-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    .comment-author-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .comment-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--accent-color);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .comment-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .comment-author-text {
      display: flex;
      flex-direction: column;
    }

    .comment-name-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .comment-name {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .comment-role-pill {
      font-size: 0.68rem;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      background: rgba(255, 107, 44, 0.15);
      color: var(--accent-color);
      font-weight: 700;
      text-transform: uppercase;
    }

    .comment-role-pill.admin-pill {
      background: rgba(139, 92, 246, 0.15);
      color: #8b5cf6;
    }

    .comment-timestamp {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .btn-delete-comment {
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-delete-comment:hover {
      background: rgba(239, 68, 68, 0.1);
    }

    .comment-content-text {
      color: var(--text-primary);
      font-size: 0.92rem;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .empty-comments-state {
      text-align: center;
      padding: 2.5rem 1.5rem;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    /* Empty state */
    .no-reviews-box {
      text-align: center;
      padding: 3rem 1.5rem;
      background: var(--bg-color);
      border-radius: 12px;
      border: 1px dashed var(--border-color);
      color: var(--text-muted);
    }

    .write-first-review-btn {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.6rem 1.25rem;
      background: var(--accent-color);
      color: #ffffff;
      border-radius: 8px;
      font-weight: 700;
      text-decoration: none;
    }

    /* Sidebar */
    .game-toc-sidebar {
      width: 300px;
      flex-shrink: 0;
      position: sticky;
      top: 90px;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .toc-sticky-card {
      background-color: var(--card-bg);
      border-radius: 14px;
      padding: 1.25rem;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 16px var(--shadow);
      max-height: calc(100vh - 280px);
      overflow-y: auto;
    }

    .toc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid var(--border-color);
    }

    .toc-header-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .toc-icon {
      color: var(--accent-color);
    }

    .toc-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-primary);
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
      gap: 0.25rem;
    }

    .toc-item {
      position: relative;
    }

    .toc-link {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      width: 100%;
      padding: 0.35rem 0.5rem;
      background: transparent;
      border: none;
      text-align: left;
      cursor: pointer;
      border-radius: 6px;
      color: var(--text-secondary);
      font-size: 0.82rem;
      font-family: inherit;
      line-height: 1.35;
      transition: all 0.15s ease;
    }

    .toc-link:hover {
      color: var(--text-primary);
      background-color: var(--bg-color);
    }

    .toc-indicator {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--text-muted);
      flex-shrink: 0;
      transition: all 0.2s ease;
    }

    .toc-item.active .toc-link {
      color: var(--accent-color);
      font-weight: 600;
      background-color: rgba(255, 107, 44, 0.08);
    }

    .toc-item.active .toc-indicator {
      background: var(--accent-color);
      transform: scale(1.5);
    }

    .toc-item.level-2 {
      padding-left: 0.75rem;
    }

    .toc-item.level-2 .toc-link {
      font-size: 0.78rem;
    }

    /* Soundtrack Player Card */
    .soundtrack-card {
      background-color: var(--card-bg);
      border-radius: 14px;
      padding: 1.1rem;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 16px var(--shadow);
    }

    .soundtrack-header {
      margin-bottom: 0.75rem;
    }

    .soundtrack-title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.15rem;
    }

    .soundtrack-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .soundtrack-subtitle {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .soundtrack-player-frame {
      position: relative;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      background: #000000;
      height: 150px;
    }

    .soundtrack-player-frame iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }

    /* Original Spoiler styles */
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

    :host ::ng-deep .content-body img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 1.5rem 0;
      cursor: zoom-in;
      transition: transform 0.2s ease;
    }

    :host ::ng-deep .content-body img:hover {
      transform: scale(1.01);
    }

    /* Comparison Block */
    :host ::ng-deep .image-comparison-block {
      position: relative;
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      margin: 2rem 0;
      user-select: none;
      -webkit-user-select: none;
      cursor: ew-resize;
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 16px var(--shadow);
    }

    :host ::ng-deep .image-comparison-block .comparison-base img,
    :host ::ng-deep .image-comparison-block .comparison-overlay img {
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
      width: 100%;
      height: 100%;
      pointer-events: none;
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

    :host ::ng-deep .image-comparison-block .badge-before { left: 16px; }
    :host ::ng-deep .image-comparison-block .badge-after { right: 16px; }
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

    /* Lightbox */
    .lightbox {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100000;
      cursor: zoom-out;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .lightbox img {
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
      border-radius: 8px;
    }

    .lightbox-close {
      position: absolute;
      top: 20px;
      right: 20px;
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 2rem;
      cursor: pointer;
    }

    .loading, .error {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top: 4px solid var(--accent-color);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .back-home-btn {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: var(--accent-color);
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
    }

    @media (max-width: 992px) {
      .game-page-layout {
        flex-direction: column;
        padding: 1.25rem 1rem;
      }
      .game-container {
        padding: 1.5rem;
      }
      .game-toc-sidebar {
        width: 100%;
        position: static;
      }
      .game-title {
        font-size: 1.75rem;
      }
    }

    @media (max-width: 768px) {
      .game-container {
        padding: 1.25rem 1rem;
        border-radius: 12px;
      }

      .game-title {
        font-size: 1.35rem;
        margin-bottom: 0.5rem;
      }

      .overall-score-badge {
        padding: 0.2rem 0.55rem;
      }

      .overall-score-badge .score-val {
        font-size: 0.95rem;
      }

      .overall-score-badge .score-max,
      .overall-score-badge .score-count,
      .reading-time {
        font-size: 0.68rem;
      }

      .fav-btn, .zen-btn {
        font-size: 0.7rem;
      }

      .fav-btn {
        width: 30px;
        height: 30px;
      }

      .zen-btn {
        padding: 0.25rem 0.5rem;
        gap: 0.35rem;
      }

      .status-badge, .playtime-badge {
        font-size: 0.68rem;
        padding: 0.18rem 0.45rem;
      }

      .category-link, .platform-chip {
        font-size: 0.68rem;
        padding: 0.15rem 0.45rem;
      }

      .platforms-label, .meta {
        font-size: 0.68rem;
      }

      .reviewers-section {
        padding: 0.75rem;
      }

      .reviewers-section-title {
        font-size: 0.78rem;
      }

      .reviewer-tab-btn {
        padding: 0.25rem 0.5rem;
        gap: 0.4rem;
        border-radius: 8px;
      }

      .reviewer-avatar {
        width: 20px;
        height: 20px;
        font-size: 0.65rem;
      }

      .reviewer-tab-name {
        font-size: 0.72rem;
      }

      .reviewer-tab-score {
        font-size: 0.65rem;
      }

      .review-title {
        font-size: 1.15rem;
      }

      .review-byline {
        font-size: 0.72rem;
      }

      /* Compact mobile review text */
      .content-body {
        font-size: 0.8rem;
        line-height: 1.65;
      }

      .content-body p {
        margin-bottom: 0.8rem;
      }

      :host ::ng-deep .content-body .ql-size-huge {
        font-size: 1.15rem;
      }

      :host ::ng-deep .content-body .ql-size-large {
        font-size: 0.98rem;
      }

      .hardware-specs {
        padding: 0.75rem;
        font-size: 0.75rem;
      }

      .hardware-specs h3 {
        font-size: 0.85rem;
      }

      .author-signature-card {
        padding: 0.75rem;
        gap: 0.75rem;
        margin-top: 1.75rem;
        margin-bottom: 1.75rem;
      }

      .signature-avatar {
        width: 38px;
        height: 38px;
        font-size: 0.9rem;
      }

      .signature-name {
        font-size: 0.85rem;
      }

      .signature-desc {
        font-size: 0.72rem;
      }

      .comments-title {
        font-size: 1.05rem;
      }

      .add-comment-card {
        padding: 0.85rem;
      }

      .comment-textarea {
        font-size: 0.78rem;
        padding: 0.5rem 0.75rem;
      }

      .comment-item {
        padding: 0.85rem;
      }

      .comment-content-text {
        font-size: 0.76rem;
      }

      .comment-name {
        font-size: 0.78rem;
      }

      .comment-timestamp {
        font-size: 0.68rem;
      }

      .zen-floating-bar {
        top: auto;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        padding: 0.38rem 0.8rem;
        gap: 0.65rem;
        max-width: calc(100vw - 32px);
        box-sizing: border-box;
      }

      .zen-desktop-text {
        display: none !important;
      }

      .zen-mobile-text {
        display: inline !important;
      }

      .zen-title {
        font-size: 0.78rem;
      }

      .zen-exit-btn {
        padding: 0.22rem 0.6rem;
        font-size: 0.72rem;
      }

      .game-page-layout.zen-active {
        padding-top: 1.5rem;
        padding-bottom: 5rem;
      }

      .game-page-layout.zen-active .content-body {
        font-size: 0.88rem;
        line-height: 1.7;
      }
    }
  `]
})
export class GameDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  public authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private tocService = inject(TocService);
  private meta = inject(Meta);
  private titleService = inject(Title);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  game: Game | null = null;
  averages: GameAverages | null = null;
  reviewers: ReviewerSummary[] = [];
  selectedReview: Review | null = null;
  favoriteCount = 0;
  isFavorite = false;
  readingTimeMinutes = 0;

  // Comments
  comments: ReviewComment[] = [];
  newCommentText = '';
  submittingComment = false;

  loading = true;
  error: string | null = null;
  processedContent: SafeHtml = '';
  lightboxImage: string | null = null;

  tocItems: TocItem[] = [];
  activeTocId: string | null = null;
  readingProgress = 0;
  isZenMode = false;
  soundtrackEmbedUrl: SafeResourceUrl | null = null;

  private activeComparisonBlock: HTMLElement | null = null;
  private onPointerMoveBound = (e: MouseEvent | TouchEvent) => this.handlePointerMove(e);
  private onPointerUpBound = () => this.handlePointerUp();

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.lightboxImage) {
        this.closeLightbox();
      } else if (this.isZenMode) {
        this.toggleZenMode();
      }
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.route.queryParamMap.subscribe(queryParams => {
          const reviewerId = queryParams.get('reviewer') ? parseInt(queryParams.get('reviewer')!) : undefined;
          const reviewId = queryParams.get('review') ? parseInt(queryParams.get('review')!) : undefined;
          this.loadGame(slug, reviewerId, reviewId);
        });
      }
    });
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
      window.addEventListener('mousemove', this.onPointerMoveBound);
      window.addEventListener('touchmove', this.onPointerMoveBound, { passive: false });
      window.addEventListener('mouseup', this.onPointerUpBound);
      window.addEventListener('touchend', this.onPointerUpBound);

      // Handle comparison pointer down
      document.addEventListener('mousedown', (e) => this.handlePointerDown(e));
      document.addEventListener('touchstart', (e) => this.handlePointerDown(e), { passive: false });
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.onPointerMoveBound);
      window.removeEventListener('touchmove', this.onPointerMoveBound);
      window.removeEventListener('mouseup', this.onPointerUpBound);
      window.removeEventListener('touchend', this.onPointerUpBound);
    }
    this.tocService.clear();

    // Clean up SEO elements
    const jsonLdScript = this.document?.querySelector?.('#game-review-jsonld');
    if (jsonLdScript) jsonLdScript.remove();
    const canonicalLink = this.document?.querySelector?.('link[rel="canonical"]');
    if (canonicalLink) canonicalLink.remove();
  }

  loadGame(slug: string, reviewerId?: number, reviewId?: number): void {
    this.loading = true;
    this.error = null;

    this.api.getGame(slug, reviewerId, reviewId).subscribe({
      next: (res) => {
        this.game = res.game;
        this.averages = res.averages;
        this.reviewers = res.reviewers || [];
        this.selectedReview = res.selectedReview;
        this.favoriteCount = res.favoriteCount || res.game.favoriteCount || 0;
        this.isFavorite = !!res.isFavorite;

        if (this.game.soundtrackUrl) {
          this.processSoundtrackUrl(this.game.soundtrackUrl);
        } else {
          this.soundtrackEmbedUrl = null;
        }

        if (this.selectedReview) {
          this.comments = this.selectedReview.comments || [];
          this.processReviewContent(this.selectedReview.content);
        } else {
          this.comments = [];
          this.processedContent = '';
          this.tocItems = [];
          this.tocService.clear();
          this.readingTimeMinutes = 0;
        }

        this.loading = false;
        this.updateSeoMeta();
      },
      error: (err) => {
        console.error('Error loading game:', err);
        this.error = err.error?.error || 'Nie udało się załadować recenzji gry.';
        this.loading = false;
      }
    });
  }

  selectReviewer(userId: number): void {
    if (!this.game) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { reviewer: userId },
      queryParamsHandling: 'merge'
    });
  }

  hasUserReviewed(): boolean {
    const user = this.authService.user();
    if (!user || !this.reviewers) return false;
    return this.reviewers.some(r => r.userId === user.id);
  }

  toggleFavorite(): void {
    if (!this.game) return;
    this.api.toggleFavorite(this.game.id).subscribe({
      next: (res) => {
        this.isFavorite = res.favorited;
        this.favoriteCount = res.favoriteCount;
      },
      error: (err) => console.error('Error toggling favorite:', err)
    });
  }

  submitComment(): void {
    if (!this.selectedReview || !this.newCommentText.trim()) return;

    this.submittingComment = true;
    this.api.addComment(this.selectedReview.id, this.newCommentText.trim()).subscribe({
      next: (newComment) => {
        this.comments.push(newComment);
        this.newCommentText = '';
        this.submittingComment = false;
        this.updateTocCommentsItem();
      },
      error: (err) => {
        this.submittingComment = false;
        alert('Błąd dodawania komentarza: ' + (err.error?.error || err.message));
      }
    });
  }

  deleteComment(commentId: number): void {
    if (confirm('Czy na pewno chcesz usunąć ten komentarz?')) {
      this.api.deleteComment(commentId).subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c.id !== commentId);
          this.updateTocCommentsItem();
        },
        error: (err) => alert('Błąd usuwania komentarza: ' + (err.error?.error || err.message))
      });
    }
  }

  canDeleteComment(comment: ReviewComment): boolean {
    const user = this.authService.user();
    if (!user) return false;
    return user.role === 'admin' || user.id === comment.userId;
  }

  private updateTocCommentsItem(): void {
    const existing = this.tocItems.find(item => item.id === 'komentarze');
    if (existing) {
      existing.text = `Komentarze (${this.comments.length})`;
      this.tocService.setItems([...this.tocItems]);
    }
  }

  toggleZenMode(): void {
    this.isZenMode = !this.isZenMode;
    if (this.isZenMode && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  processSoundtrackUrl(url: string): void {
    const videoId = this.extractYouTubeId(url);
    if (videoId) {
      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;
      this.soundtrackEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else {
      this.soundtrackEmbedUrl = null;
    }
  }

  extractYouTubeId(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  private updateSeoMeta(): void {
    if (!this.game) return;

    const baseUrl = 'https://giercujemy-staa.duckdns.org';
    const gameUrl = `${baseUrl}/game/${this.game.slug}`;
    const gameTitle = this.game.gameTitle;

    // Build page title
    const pageTitle = `Recenzja ${gameTitle} | Giercujemy`;
    this.titleService.setTitle(pageTitle);

    // Build description
    let description = `Recenzja gry ${gameTitle} na Giercujemy.`;
    if (this.averages && this.averages.reviewCount > 0) {
      description += ` Ocena: ${this.averages.averageRating.toFixed(1)}/10.`;
    }
    if (this.selectedReview?.title) {
      description += ` ${this.selectedReview.title}`;
    }
    // Truncate to 160 chars
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }

    // Build image URL
    let imageUrl = `${baseUrl}/favicon.png`;
    if (this.game.coverImage) {
      const cover = this.game.coverImage;
      if (cover.startsWith('http')) {
        imageUrl = cover;
      } else if (cover.startsWith('/uploads/')) {
        imageUrl = `${baseUrl}${cover}`;
      } else {
        imageUrl = `${baseUrl}/uploads/${cover}`;
      }
    }

    // Update meta tags
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: gameUrl });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });

    // Canonical URL
    this.updateCanonicalUrl(gameUrl);

    // JSON-LD Structured Data
    this.updateJsonLd();
  }

  private updateCanonicalUrl(url: string): void {
    // Remove existing canonical link
    const existingLink = this.document.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.remove();
    }
    // Add new canonical link
    const link = this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    this.document.head.appendChild(link);
  }

  private updateJsonLd(): void {
    if (!this.game) return;

    const baseUrl = 'https://giercujemy-staa.duckdns.org';

    // Remove existing JSON-LD
    const existingScript = this.document.querySelector('script[type="application/ld+json"]#game-review-jsonld');
    if (existingScript) {
      existingScript.remove();
    }

    // Build image URL
    let imageUrl = '';
    if (this.game.coverImage) {
      const cover = this.game.coverImage;
      if (cover.startsWith('http')) {
        imageUrl = cover;
      } else if (cover.startsWith('/uploads/')) {
        imageUrl = `${baseUrl}${cover}`;
      } else {
        imageUrl = `${baseUrl}/uploads/${cover}`;
      }
    }

    const jsonLd: any = {
      '@context': 'https://schema.org',
      '@type': 'Review',
      'itemReviewed': {
        '@type': 'VideoGame',
        'name': this.game.gameTitle,
        'url': `${baseUrl}/game/${this.game.slug}`,
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Giercujemy'
      }
    };

    if (imageUrl) {
      jsonLd.itemReviewed.image = imageUrl;
    }

    if (this.game.genres && this.game.genres.length > 0) {
      jsonLd.itemReviewed.genre = this.game.genres.map(g => g.name);
    }

    if (this.game.releaseDate) {
      jsonLd.itemReviewed.datePublished = this.game.releaseDate;
    }

    if (this.game.studio) {
      jsonLd.itemReviewed.author = {
        '@type': 'Organization',
        'name': this.game.studio.name
      };
    }

    if (this.selectedReview) {
      jsonLd.reviewRating = {
        '@type': 'Rating',
        'ratingValue': this.selectedReview.averageRating,
        'bestRating': 10,
        'worstRating': 0
      };
      jsonLd.name = this.selectedReview.title;
      jsonLd.datePublished = this.selectedReview.createdAt;
      jsonLd.dateModified = this.selectedReview.updatedAt;

      if (this.selectedReview.author) {
        jsonLd.author = {
          '@type': 'Person',
          'name': this.selectedReview.author.displayName || this.selectedReview.author.username
        };
      }
    }

    // Aggregate rating from all reviewers
    if (this.averages && this.averages.reviewCount > 0) {
      jsonLd.itemReviewed.aggregateRating = {
        '@type': 'AggregateRating',
        'ratingValue': this.averages.averageRating,
        'bestRating': 10,
        'worstRating': 0,
        'reviewCount': this.averages.reviewCount
      };
    }

    const script = this.document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('id', 'game-review-jsonld');
    script.textContent = JSON.stringify(jsonLd);
    this.document.head.appendChild(script);
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/uploads/')) {
      return url;
    }
    return `/uploads/${url}`;
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'platyna': return 'Platyna (100%)';
      case 'main_story': return 'Główny wątek';
      case 'in_progress': return 'W trakcie';
      case 'abandoned': return 'Porzucona';
      default: return 'Główny wątek';
    }
  }

  sanitize(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  processReviewContent(content: string): void {
    if (!content) {
      this.processedContent = '';
      this.tocItems = [];
      this.tocService.clear();
      this.readingTimeMinutes = 0;
      return;
    }

    // Calculate reading time (words / 175, rounded up to nearest minute)
    const plainText = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\[\/?(SPOILER|COMPARE)[^\]]*\]/gi, ' ');
    const words = plainText.trim().split(/\s+/).filter(w => w.length > 0);
    this.readingTimeMinutes = words.length > 0 ? Math.ceil(words.length / 175) : 0;

    let processed = content;

    // 1. Spoilers [SPOILER]...[/SPOILER]
    processed = processed.replace(
      /\[SPOILER\]([\s\S]*?)\[\/SPOILER\]/gi,
      `<div class="spoiler-box" data-spoiler="true">
        <div class="spoiler-label">[SPOILER] <span>Kliknij, aby odsłonić treść</span></div>
        <div class="spoiler-text">$1</div>
      </div>`
    );

    // 2. Comparison Slider [COMPARE before="..." after="..." ...]
    processed = processed.replace(
      /\[COMPARE\s+before=["']([^"']+)["']\s+after=["']([^"']+)["'](?:\s+labelBefore=["']([^"']*)["'])?(?:\s+labelAfter=["']([^"']*)["'])?\s*\]/gi,
      (_match, before, after, labelBefore, labelAfter) => {
        const lblB = labelBefore || 'Przed';
        const lblA = labelAfter || 'Po';
        const urlB = this.getImageUrl(before);
        const urlA = this.getImageUrl(after);
        return `
          <div class="image-comparison-block" data-comparison="true">
            <div class="comparison-base">
              <img src="${urlA}" alt="${lblA}" draggable="false" />
            </div>
            <div class="comparison-overlay" style="clip-path: inset(0 50% 0 0);">
              <img src="${urlB}" alt="${lblB}" draggable="false" />
            </div>
            <span class="comparison-badge badge-before">${lblB}</span>
            <span class="comparison-badge badge-after">${lblA}</span>
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

    // 3. Extract TOC headings
    const { htmlWithIds, items } = this.extractHeadings(processed);
    
    // Always append Comments section to TOC
    items.push({
      id: 'komentarze',
      text: `Komentarze (${this.comments.length})`,
      level: 1
    });

    this.processedContent = this.sanitizer.bypassSecurityTrustHtml(htmlWithIds);
    this.tocItems = items;
    this.tocService.setItems(items);
  }

  private extractHeadings(html: string): { htmlWithIds: string; items: TocItem[] } {
    if (typeof window === 'undefined') {
      return { htmlWithIds: html, items: [] };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const items: TocItem[] = [];
    const usedIds = new Set<string>();

    const headingNodes = doc.querySelectorAll('.ql-size-huge, .ql-size-large');

    headingNodes.forEach((node, index) => {
      const text = node.textContent?.trim() || '';
      if (!text) return;

      const level = node.classList.contains('ql-size-huge') ? 1 : 2;
      let slug = this.slugify(text) || `sekcja-${index + 1}`;
      let uniqueId = slug;
      let counter = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${slug}-${counter++}`;
      }
      usedIds.add(uniqueId);

      node.setAttribute('id', uniqueId);
      items.push({ id: uniqueId, text, level });
    });

    return {
      htmlWithIds: doc.body.innerHTML,
      items
    };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[ąĄ]/g, 'a').replace(/[ćĆ]/g, 'c').replace(/[ęĘ]/g, 'e')
      .replace(/[łŁ]/g, 'l').replace(/[ńŃ]/g, 'n').replace(/[óÓ]/g, 'o')
      .replace(/[śŚ]/g, 's').replace(/[źŹżŻ]/g, 'z')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 40)
      .replace(/^-+|-+$/g, '');
  }

  scrollTo(id: string): void {
    if (typeof window === 'undefined') return;
    const element = document.getElementById(id);
    if (element) {
      const spoiler = element.closest('.spoiler-box');
      if (spoiler && !spoiler.classList.contains('revealed')) {
        spoiler.classList.add('revealed');
      }

      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      this.activeTocId = id;
      this.tocService.setActiveId(id);
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

  private handleScroll(): void {
    if (typeof window === 'undefined') return;

    // Progress bar
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    this.readingProgress = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)) : 0;

    // Active TOC heading
    if (this.tocItems.length === 0) return;
    const scrollPos = window.scrollY + 120;
    for (let i = this.tocItems.length - 1; i >= 0; i--) {
      const el = document.getElementById(this.tocItems[i].id);
      if (el && el.offsetTop <= scrollPos) {
        if (this.activeTocId !== this.tocItems[i].id) {
          this.activeTocId = this.tocItems[i].id;
          this.tocService.setActiveId(this.tocItems[i].id);
        }
        break;
      }
    }
  }

  private handlePointerDown(event: MouseEvent | TouchEvent): void {
    const target = event.target as HTMLElement;
    const comparisonBlock = target.closest('.image-comparison-block') as HTMLElement;
    if (comparisonBlock) {
      this.activeComparisonBlock = comparisonBlock;
      this.updateComparisonPosition(comparisonBlock, event);
      if (event.cancelable) event.preventDefault();
    }
  }

  private handlePointerMove(event: MouseEvent | TouchEvent): void {
    if (!this.activeComparisonBlock) return;
    this.updateComparisonPosition(this.activeComparisonBlock, event);
    if (event.cancelable) event.preventDefault();
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
      if (percentage <= 8) badgeBefore.classList.add('badge-hidden');
      else badgeBefore.classList.remove('badge-hidden');
    }
    if (badgeAfter) {
      if (percentage >= 92) badgeAfter.classList.add('badge-hidden');
      else badgeAfter.classList.remove('badge-hidden');
    }
  }

  closeLightbox(): void {
    this.lightboxImage = null;
  }
}
