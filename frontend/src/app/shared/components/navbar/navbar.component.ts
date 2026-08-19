import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { TocService } from '../../../core/services/toc.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/" class="logo">
          <span class="logo-text">Strona główna</span>
        </a>
      </div>

      <!-- Burger menu button (mobile) -->
      <button class="burger-btn" (click)="toggleMenu()" [class.active]="menuOpen">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Menu content -->
      <div class="navbar-content" [class.open]="menuOpen">
        <div class="navbar-menu">
          <a routerLink="/genres" routerLinkActive="active" class="nav-link" (click)="closeMenu()">
            Gatunki
          </a>
          <a routerLink="/series" routerLinkActive="active" class="nav-link" (click)="closeMenu()">
            Serie
          </a>
          <a routerLink="/studios" routerLinkActive="active" class="nav-link" (click)="closeMenu()">
            Studia
          </a>
          <a *ngIf="authService.isAuthenticated()" routerLink="/account/favorites" routerLinkActive="active" class="nav-link" (click)="closeMenu()">
            Ulubione
          </a>
        </div>

        <!-- Mobile Table of Contents -->
        <div class="navbar-toc" *ngIf="tocService.tocItems().length > 0">
          <div class="toc-mobile-header">
            <svg class="toc-mobile-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>Struktura recenzji</span>
          </div>
          <ul class="toc-mobile-list">
            <li *ngFor="let item of tocService.tocItems()"
                class="toc-mobile-item"
                [class.level-1]="item.level === 1"
                [class.level-2]="item.level === 2"
                [class.active]="tocService.activeId() === item.id">
              <button type="button" (click)="onTocItemClick(item.id)" class="toc-mobile-link">
                <span class="toc-mobile-dot"></span>
                <span class="toc-mobile-text">{{ item.text }}</span>
              </button>
            </li>
          </ul>
        </div>

        <div class="navbar-search">
          <div class="search-container">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (keyup.enter)="search()"
              placeholder="Szukaj..."
              class="search-input"
            >
            <button (click)="search()" class="search-btn">Szukaj</button>
          </div>
        </div>

        <div class="navbar-auth">
          <button (click)="themeService.toggleTheme()" class="theme-toggle-btn">
            {{ themeService.theme() === 'dark' ? 'Tryb jasny' : 'Tryb ciemny' }}
          </button>
          
          <ng-container *ngIf="!authService.isAuthenticated()">
            <a routerLink="/admin/login" class="nav-auth-link" (click)="closeMenu()">
              Zaloguj
            </a>
            <a routerLink="/register" class="register-btn" (click)="closeMenu()">
              Rejestracja
            </a>
          </ng-container>

          <ng-container *ngIf="authService.isAuthenticated()">
            <a *ngIf="authService.isReviewer()" routerLink="/admin" class="nav-auth-link dashboard-link" (click)="closeMenu()">
              {{ authService.isAdmin() ? 'Panel Admin' : 'Panel Recenzenta' }}
            </a>

            <a routerLink="/account" class="user-profile-link" (click)="closeMenu()" [title]="'Konto: ' + authService.displayName()">
              <div class="navbar-avatar">
                <img *ngIf="authService.avatarUrl()" [src]="getImageUrl(authService.avatarUrl())" [alt]="authService.displayName()">
                <span *ngIf="!authService.avatarUrl()">{{ (authService.displayName() || 'U')[0].toUpperCase() }}</span>
              </div>
              <span class="navbar-username">{{ authService.displayName() }}</span>
            </a>

            <button (click)="logout()" class="logout-btn">Wyloguj</button>
          </ng-container>
        </div>
      </div>

      <!-- Overlay for mobile menu -->
      <div class="menu-overlay" *ngIf="menuOpen" (click)="closeMenu()"></div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 2rem;
      background-color: var(--header-bg);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 1000;
      transition: background-color 0.25s ease, border-color 0.25s ease;
    }

    .navbar-brand .logo {
      display: flex;
      align-items: center;
      text-decoration: none;
    }

    .logo-text {
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--accent-color);
    }

    .burger-btn {
      display: none;
      flex-direction: column;
      justify-content: space-around;
      width: 24px;
      height: 18px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      z-index: 1002;
    }

    .burger-btn span {
      width: 24px;
      height: 2px;
      background: var(--text-color);
      border-radius: 2px;
      transition: all 0.3s ease;
    }

    .burger-btn.active span:nth-child(1) { transform: rotate(45deg) translate(4px, 5px); }
    .burger-btn.active span:nth-child(2) { opacity: 0; }
    .burger-btn.active span:nth-child(3) { transform: rotate(-45deg) translate(4px, -5px); }

    .navbar-content {
      display: flex;
      align-items: center;
      flex: 1;
      justify-content: space-between;
    }

    .navbar-menu {
      display: flex;
      gap: 1.5rem;
      margin-left: 3rem;
    }

    .nav-link {
      font-size: 0.95rem;
      text-decoration: none;
      color: var(--text-muted);
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .nav-link:hover, .nav-link.active {
      color: var(--accent-color);
    }

    .navbar-toc {
      display: none;
    }

    .navbar-search {
      flex: 1;
      max-width: 320px;
      margin: 0 2rem;
    }

    .search-container {
      display: flex;
      background: var(--input-bg);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      overflow: hidden;
      transition: border-color 0.2s ease;
    }

    .search-container:focus-within {
      border-color: var(--accent-color);
    }

    .search-input {
      flex: 1;
      padding: 0.5rem 0.75rem;
      background: transparent;
      border: none;
      color: var(--text-color);
      font-size: 0.9rem;
      outline: none;
      min-width: 0;
    }

    .search-input::placeholder { color: var(--text-muted); }

    .search-btn {
      padding: 0.5rem 0.75rem;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      border-left: 1px solid var(--border-color);
      transition: color 0.2s ease;
    }

    .search-btn:hover { color: var(--accent-color); }

    .navbar-auth {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .theme-toggle-btn {
      background: transparent;
      border: 1px solid var(--border-color);
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      color: var(--text-color);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: border-color 0.2s ease, color 0.2s ease;
    }

    .theme-toggle-btn:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
    }

    .nav-auth-link {
      text-decoration: none;
      color: var(--text-muted);
      font-weight: 500;
      font-size: 0.95rem;
      transition: color 0.2s ease;
    }

    .nav-auth-link:hover {
      color: var(--accent-color);
    }

    .dashboard-link {
      color: var(--accent-color);
    }

    .register-btn {
      padding: 0.4rem 0.9rem;
      background: var(--accent-color);
      color: #ffffff;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 6px;
      transition: opacity 0.2s ease;
    }

    .register-btn:hover {
      opacity: 0.9;
    }

    .user-profile-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--text-primary);
      font-weight: 500;
      font-size: 0.9rem;
    }

    .navbar-avatar {
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

    .navbar-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .navbar-username {
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .logout-btn {
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      background: transparent;
      border: 1px solid rgba(220, 53, 69, 0.4);
      color: #ff6b7a;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .logout-btn:hover { background: rgba(220, 53, 69, 0.1); }

    .menu-overlay { display: none; }

    @media (max-width: 900px) {
      .navbar { padding: 1rem; }
      .burger-btn { display: flex; }

      .navbar-content {
        position: fixed;
        top: 0;
        right: 0;
        width: 85%;
        max-width: 320px;
        height: 100vh;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        padding: 4rem 1.5rem 2rem;
        background-color: var(--card-bg);
        border-left: 1px solid var(--border-color);
        transition: transform 0.3s ease;
        transform: translateX(100%);
        z-index: 1001;
        gap: 1.5rem;
        overflow-y: auto;
      }

      .navbar-content.open { transform: translateX(0); }

      .navbar-menu {
        flex-direction: column;
        margin-left: 0;
        gap: 1.25rem;
      }

      .nav-link {
        font-size: 1.05rem;
      }

      .navbar-toc {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.75rem 0;
        border-top: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
        max-height: 40vh;
        overflow-y: auto;
      }

      .toc-mobile-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--accent-color);
        padding: 0 0.25rem;
      }

      .toc-mobile-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .toc-mobile-link {
        width: 100%;
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.35rem 0.5rem;
        background: transparent;
        border: none;
        border-radius: 6px;
        color: var(--text-muted);
        font-size: 0.85rem;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
        line-height: 1.35;
        font-family: inherit;
      }

      .toc-mobile-item.level-1 .toc-mobile-link {
        font-weight: 600;
        color: var(--text-color);
      }

      .toc-mobile-item.level-2 .toc-mobile-link {
        padding-left: 1.25rem;
        font-size: 0.8rem;
      }

      .toc-mobile-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--border-color);
        margin-top: 6px;
        flex-shrink: 0;
        transition: all 0.2s ease;
      }

      .toc-mobile-item.level-2 .toc-mobile-dot {
        width: 4px;
        height: 4px;
        margin-top: 7px;
      }

      .toc-mobile-text {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .toc-mobile-item.active .toc-mobile-link {
        color: var(--accent-color);
        background: rgba(255, 122, 0, 0.08);
        font-weight: 600;
      }

      .toc-mobile-item.active .toc-mobile-dot {
        background: var(--accent-color);
        box-shadow: 0 0 6px var(--accent-color);
        transform: scale(1.2);
      }

      .navbar-search {
        margin: 0;
        max-width: 100%;
      }

      .navbar-auth {
        flex-direction: column;
        align-items: stretch;
        gap: 1.25rem;
      }

      .nav-auth-link, .register-btn, .logout-btn, .theme-toggle-btn {
        text-align: center;
        padding: 0.75rem;
      }

      .menu-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  tocService = inject(TocService);
  private router = inject(Router);
  searchQuery = '';
  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
      this.closeMenu();
    }
  }

  onTocItemClick(id: string): void {
    this.tocService.scrollTo(id);
    this.closeMenu();
  }

  logout(): void {
    this.authService.logout('/');
    this.closeMenu();
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return url;
    return '/uploads/' + url;
  }
}
