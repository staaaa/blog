import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

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
          
          <a *ngIf="!authService.isAuthenticated()" routerLink="/admin/login" class="admin-link" (click)="closeMenu()">
            Panel Admin
          </a>
          <ng-container *ngIf="authService.isAuthenticated()">
            <a routerLink="/admin" class="admin-link active" (click)="closeMenu()">Dashboard</a>
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

    /* Burger button - hidden on desktop */
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

    /* Desktop navbar content */
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
      gap: 1.5rem;
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

    .admin-link {
      text-decoration: none;
      color: var(--text-muted);
      font-weight: 500;
      font-size: 0.95rem;
      transition: color 0.2s ease;
    }

    .admin-link:hover, .admin-link.active {
      color: var(--accent-color);
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

    /* Mobile styles */
    @media (max-width: 900px) {
      .navbar { padding: 1rem; }
      
      .burger-btn { display: flex; }

      .navbar-content {
        position: fixed;
        top: 0;
        right: 0;
        width: 80%;
        max-width: 280px;
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
        gap: 2rem;
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

      .navbar-search {
        margin: 0;
        max-width: 100%;
      }

      .navbar-auth {
        flex-direction: column;
        align-items: stretch;
        gap: 1.25rem;
      }

      .admin-link, .logout-btn, .theme-toggle-btn {
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

  logout(): void {
    this.authService.logout();
    this.closeMenu();
  }
}
