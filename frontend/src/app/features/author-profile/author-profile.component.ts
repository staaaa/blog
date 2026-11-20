import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ApiService, AuthorProfileResponse } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';

@Component({
  selector: 'app-author-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReviewCardComponent],
  template: `
    <div class="author-page-container">
      <!-- Loading state -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
      </div>

      <!-- Error / 404 state -->
      <div class="error-card" *ngIf="error && !loading">
        <h2>Nie znaleziono recenzenta</h2>
        <p>{{ error }}</p>
        <a routerLink="/" class="btn btn-primary">Wróć na stronę główną</a>
      </div>

      <!-- Profile content -->
      <div *ngIf="profile && !loading" class="profile-layout">
        <!-- Breadcrumb & Back -->
        <div class="top-nav">
          <a routerLink="/" class="back-link">← Strona główna</a>
        </div>

        <!-- Author Header Card -->
        <header class="author-hero-card">
          <div class="author-hero-content">
            <div class="author-avatar-wrap">
              <img
                *ngIf="profile.author.avatarUrl"
                [src]="getImageUrl(profile.author.avatarUrl)"
                [alt]="profile.author.displayName || profile.author.username"
                class="author-avatar-img"
              />
              <span *ngIf="!profile.author.avatarUrl" class="author-avatar-fallback">
                {{ (profile.author.displayName || profile.author.username || 'R')[0].toUpperCase() }}
              </span>
            </div>

            <div class="author-main-info">
              <div class="name-role-row">
                <h1 class="author-name">{{ profile.author.displayName || profile.author.username }}</h1>
                <span
                  class="role-badge"
                  [class.badge-admin]="profile.author.role === 'admin'"
                >
                  {{ profile.author.role === 'admin' ? 'Administrator' : 'Recenzent' }}
                </span>
              </div>

              <div class="author-meta-row">
                <span class="author-handle">&#64;{{ profile.author.username }}</span>
                <span class="meta-dot">·</span>
                <span class="author-joined" *ngIf="profile.author.createdAt">
                  W zespole od {{ profile.author.createdAt | date: 'MMMM yyyy' }}
                </span>
              </div>

              <!-- Author Bio -->
              <div class="author-bio-box" *ngIf="profile.author.bio">
                <p class="author-bio-text">{{ profile.author.bio }}</p>
              </div>

              <div class="author-bio-empty" *ngIf="!profile.author.bio">
                <p>Recenzent nie dodał jeszcze opisu o sobie.</p>
              </div>

              <!-- Owner Edit Shortcut -->
              <div class="author-actions" *ngIf="isCurrentUser()">
                <a routerLink="/account" class="btn btn-outline-sm">
                  ✏️ Edytuj swój profil i opis
                </a>
              </div>
            </div>
          </div>

          <!-- Quick Stats Cards -->
          <div class="author-stats-bar">
            <div class="stat-item">
              <span class="stat-value">{{ profile.stats.totalReviews }}</span>
              <span class="stat-label">{{ profile.stats.totalReviews === 1 ? 'Napisana recenzja' : 'Napisane recenzje' }}</span>
            </div>

            <div class="stat-divider"></div>

            <div class="stat-item">
              <span class="stat-value highlight-rating">
                ★ {{ profile.stats.averageRating > 0 ? profile.stats.averageRating.toFixed(1) : '-' }}
              </span>
              <span class="stat-label">Średnia ocen gier</span>
            </div>
          </div>
        </header>

        <!-- Reviews Grid Section -->
        <section class="author-reviews-section">
          <div class="section-heading">
            <h2>Recenzje autora ({{ profile.pagination.total }})</h2>
            <p class="section-sub">Wszystkie gry zrecenzowane i ocenione przez {{ profile.author.displayName || profile.author.username }}</p>
          </div>

          <div class="reviews-grid" *ngIf="profile.games.length > 0">
            <app-review-card
              *ngFor="let game of profile.games"
              [game]="game"
            ></app-review-card>
          </div>

          <div class="empty-reviews" *ngIf="profile.games.length === 0">
            <p>Ten autor nie opublikował jeszcze żadnej recenzji.</p>
          </div>

          <!-- Pagination -->
          <div class="pagination-bar" *ngIf="profile.pagination.totalPages > 1">
            <button
              class="page-btn"
              [disabled]="profile.pagination.page <= 1"
              (click)="goToPage(profile.pagination.page - 1)"
            >
              ← Poprzednia
            </button>

            <span class="page-info">
              Strona {{ profile.pagination.page }} z {{ profile.pagination.totalPages }}
            </span>

            <button
              class="page-btn"
              [disabled]="profile.pagination.page >= profile.pagination.totalPages"
              (click)="goToPage(profile.pagination.page + 1)"
            >
              Następna →
            </button>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .author-page-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem;
    }

    .top-nav {
      margin-bottom: 1.5rem;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      transition: color 0.2s ease;
    }

    .back-link:hover {
      color: var(--accent-color);
    }

    /* Author Hero Card */
    .author-hero-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 2.5rem;
      margin-bottom: 3rem;
      box-shadow: 0 8px 30px var(--shadow);
    }

    .author-hero-content {
      display: flex;
      gap: 2rem;
      align-items: flex-start;
    }

    .author-avatar-wrap {
      flex-shrink: 0;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid var(--accent-color);
      box-shadow: 0 4px 14px rgba(255, 122, 0, 0.25);
      background: var(--input-bg);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .author-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .author-avatar-fallback {
      font-size: 3rem;
      font-weight: 800;
      color: var(--accent-color);
    }

    .author-main-info {
      flex: 1;
      min-width: 0;
    }

    .name-role-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 0.35rem;
    }

    .author-name {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.15;
    }

    .role-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 0.25rem 0.65rem;
      border-radius: 20px;
      background: rgba(255, 122, 0, 0.15);
      color: var(--accent-color);
      border: 1px solid rgba(255, 122, 0, 0.3);
    }

    .role-badge.badge-admin {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.3);
    }

    .author-meta-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
    }

    .author-handle {
      font-weight: 600;
      color: var(--text-secondary);
    }

    .meta-dot {
      color: var(--border-color);
    }

    .author-bio-box {
      margin-bottom: 1.25rem;
      background: var(--input-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 1rem 1.25rem;
    }

    .author-bio-text {
      color: var(--text-primary);
      font-size: 1rem;
      line-height: 1.65;
      margin: 0;
      white-space: pre-line;
      word-break: break-word;
    }

    .author-bio-empty {
      font-size: 0.9rem;
      font-style: italic;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .author-actions {
      margin-top: 1rem;
    }

    .btn-outline-sm {
      display: inline-block;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-primary);
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-outline-sm:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
      background: rgba(255, 122, 0, 0.05);
    }

    /* Stats Bar */
    .author-stats-bar {
      display: flex;
      align-items: center;
      border-top: 1px solid var(--border-color);
      margin-top: 2rem;
      padding-top: 1.75rem;
      gap: 3rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
    }

    .stat-value.highlight-rating {
      color: var(--accent-color);
    }

    .stat-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background: var(--border-color);
    }

    /* Reviews Section */
    .author-reviews-section {
      margin-top: 2rem;
    }

    .section-heading {
      margin-bottom: 2rem;
    }

    .section-heading h2 {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 0.35rem;
    }

    .section-sub {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin: 0;
    }

    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 2rem;
    }

    .empty-reviews {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-muted);
      font-size: 1.05rem;
      background: var(--card-bg);
      border: 1px dashed var(--border-color);
      border-radius: 12px;
    }

    /* Pagination */
    .pagination-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      margin-top: 3rem;
    }

    .page-btn {
      padding: 0.5rem 1.25rem;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--card-bg);
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .page-btn:hover:not(:disabled) {
      border-color: var(--accent-color);
      color: var(--accent-color);
    }

    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .page-info {
      font-size: 0.9rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* Loading / Error */
    .loading-state {
      display: flex;
      justify-content: center;
      padding: 6rem 0;
    }

    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top: 3px solid var(--accent-color);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-card {
      text-align: center;
      padding: 4rem 1.5rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      max-width: 500px;
      margin: 4rem auto;
    }

    .error-card h2 {
      font-size: 1.5rem;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .error-card p {
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .author-page-container {
        padding: 1.5rem 1rem 3rem;
      }

      .author-hero-card {
        padding: 1.5rem;
      }

      .author-hero-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1.25rem;
      }

      .name-role-row {
        justify-content: center;
      }

      .author-name {
        font-size: 1.8rem;
      }

      .author-meta-row {
        justify-content: center;
      }

      .author-stats-bar {
        justify-content: space-around;
        gap: 1rem;
      }

      .reviews-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AuthorProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private title = inject(Title);
  private meta = inject(Meta);
  public authService = inject(AuthService);

  profile: AuthorProfileResponse | null = null;
  loading = true;
  error: string | null = null;
  username = '';
  currentPage = 1;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const u = params.get('username');
      if (u) {
        this.username = u;
        this.currentPage = 1;
        this.loadProfile();
      }
    });
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;

    this.api.getAuthorProfile(this.username, this.currentPage).subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
        this.updateMetaTags(data);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Nie udało się wczytać profilu recenzenta.';
      }
    });
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadProfile();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  isCurrentUser(): boolean {
    const logged = this.authService.user();
    return !!logged && logged.username === this.username;
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return url;
    return '/uploads/' + url;
  }

  private updateMetaTags(data: AuthorProfileResponse): void {
    const name = data.author.displayName || data.author.username;
    const siteTitle = `${name} – Profil Recenzenta | Giercujemy`;
    this.title.setTitle(siteTitle);

    const desc = data.author.bio
      ? data.author.bio.slice(0, 155)
      : `Zobacz profil recenzenta ${name} na portalu Giercujemy. Przeczytaj opinie, oceny i recenzje gier autora.`;

    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: siteTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
    if (data.author.avatarUrl) {
      this.meta.updateTag({ property: 'og:image', content: this.getImageUrl(data.author.avatarUrl) });
    }
  }
}
