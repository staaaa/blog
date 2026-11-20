import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ApiService, AuthorSummary } from '../../core/services/api.service';

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="authors-page-container">
      <header class="page-header">
        <h1 class="page-title">Nasi Recenzenci</h1>
        <p class="page-subtitle">Poznaj zespół redakcyjny Giercujemy, autorów naszych recenzji i ich styl oceniania.</p>
      </header>

      <!-- Loading state -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
      </div>

      <!-- Authors Grid -->
      <div class="authors-grid" *ngIf="!loading && authors.length > 0">
        <div class="author-card" *ngFor="let author of authors">
          <div class="card-top">
            <a [routerLink]="['/author', author.username]" class="avatar-link">
              <div class="author-avatar-wrap">
                <img
                  *ngIf="author.avatarUrl"
                  [src]="getImageUrl(author.avatarUrl)"
                  [alt]="author.displayName || author.username"
                  class="author-avatar-img"
                />
                <span *ngIf="!author.avatarUrl" class="author-avatar-fallback">
                  {{ (author.displayName || author.username || 'R')[0].toUpperCase() }}
                </span>
              </div>
            </a>

            <div class="author-card-info">
              <div class="author-name-row">
                <a [routerLink]="['/author', author.username]" class="name-link">
                  <h2 class="author-name">{{ author.displayName || author.username }}</h2>
                </a>
                <span
                  class="role-badge"
                  [class.badge-admin]="author.role === 'admin'"
                >
                  {{ author.role === 'admin' ? 'Administrator' : 'Recenzent' }}
                </span>
              </div>
              <span class="author-username">&#64;{{ author.username }}</span>
            </div>
          </div>

          <!-- Bio snippet -->
          <div class="card-bio">
            <p *ngIf="author.bio" class="bio-text">{{ author.bio }}</p>
            <p *ngIf="!author.bio" class="bio-empty">Recenzent nie dodał jeszcze opisu.</p>
          </div>

          <!-- Card Stats & Action -->
          <div class="card-footer">
            <div class="card-stats">
              <div class="stat-box">
                <span class="stat-number">{{ author.stats.totalReviews }}</span>
                <span class="stat-text">{{ author.stats.totalReviews === 1 ? 'recenzja' : 'recenzji' }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-number stat-rating">★ {{ author.stats.averageRating > 0 ? author.stats.averageRating.toFixed(1) : '-' }}</span>
                <span class="stat-text">śr. ocen</span>
              </div>
            </div>

            <a [routerLink]="['/author', author.username]" class="btn-view-profile">
              Zobacz profil →
            </a>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && authors.length === 0">
        <p>Brak aktywnych recenzentów w zespole.</p>
      </div>
    </div>
  `,
  styles: [`
    .authors-page-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 5rem;
    }

    .page-header {
      margin-bottom: 3rem;
      text-align: center;
    }

    .page-title {
      font-size: 2.4rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 0.5rem;
    }

    .page-subtitle {
      font-size: 1.05rem;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .authors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }

    .author-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px var(--shadow);
      transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
    }

    .author-card:hover {
      transform: translateY(-4px);
      border-color: var(--accent-color);
      box-shadow: 0 12px 28px var(--shadow);
    }

    .card-top {
      display: flex;
      gap: 1.25rem;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .avatar-link {
      text-decoration: none;
      flex-shrink: 0;
    }

    .author-avatar-wrap {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid var(--accent-color);
      background: var(--input-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(255, 122, 0, 0.2);
    }

    .author-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .author-avatar-fallback {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--accent-color);
    }

    .author-card-info {
      flex: 1;
      min-width: 0;
    }

    .author-name-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
      margin-bottom: 0.2rem;
    }

    .name-link {
      text-decoration: none;
      color: inherit;
    }

    .author-name {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.2;
      transition: color 0.15s ease;
    }

    .name-link:hover .author-name {
      color: var(--accent-color);
    }

    .role-badge {
      display: inline-block;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 0.15rem 0.5rem;
      border-radius: 12px;
      background: rgba(255, 122, 0, 0.15);
      color: var(--accent-color);
      border: 1px solid rgba(255, 122, 0, 0.3);
    }

    .role-badge.badge-admin {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.3);
    }

    .author-username {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .card-bio {
      flex: 1;
      margin-bottom: 1.5rem;
      font-size: 0.92rem;
      line-height: 1.55;
    }

    .bio-text {
      color: var(--text-secondary);
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      white-space: pre-line;
    }

    .bio-empty {
      color: var(--text-muted);
      font-style: italic;
      margin: 0;
      font-size: 0.85rem;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-color);
      padding-top: 1.25rem;
      gap: 1rem;
    }

    .card-stats {
      display: flex;
      gap: 1.25rem;
    }

    .stat-box {
      display: flex;
      flex-direction: column;
    }

    .stat-number {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
    }

    .stat-number.stat-rating {
      color: var(--accent-color);
    }

    .stat-text {
      font-size: 0.72rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-top: 0.25rem;
    }

    .btn-view-profile {
      display: inline-flex;
      align-items: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--accent-color);
      text-decoration: none;
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      border: 1px solid transparent;
      background: rgba(255, 122, 0, 0.08);
      transition: all 0.2s ease;
    }

    .btn-view-profile:hover {
      background: var(--accent-color);
      color: #ffffff;
      transform: translateX(2px);
    }

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

    .empty-state {
      text-align: center;
      padding: 4rem 1.5rem;
      color: var(--text-muted);
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .authors-page-container {
        padding: 1.5rem 1rem 3rem;
      }

      .page-title {
        font-size: 2rem;
      }

      .authors-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AuthorsComponent implements OnInit {
  private api = inject(ApiService);
  private title = inject(Title);
  private meta = inject(Meta);

  authors: AuthorSummary[] = [];
  loading = true;

  ngOnInit(): void {
    this.title.setTitle('Recenzenci | Giercujemy');
    this.meta.updateTag({
      name: 'description',
      content: 'Poznaj zespół recenzentów portalu Giercujemy, autorów naszych artykułów i ich oceny gier.'
    });

    this.api.getAuthors().subscribe({
      next: (data) => {
        this.authors = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading authors:', err);
        this.loading = false;
      }
    });
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return url;
    return '/uploads/' + url;
  }
}
