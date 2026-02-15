import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/" class="logo">
          <span class="logo-icon">🎮</span>
          <span class="logo-text">GameReviews</span>
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
            <span class="nav-icon">🏷️</span>
            Gatunki
          </a>
          <a routerLink="/series" routerLinkActive="active" class="nav-link" (click)="closeMenu()">
            <span class="nav-icon">📚</span>
            Serie
          </a>
          <a routerLink="/studios" routerLinkActive="active" class="nav-link" (click)="closeMenu()">
            <span class="nav-icon">🏢</span>
            Studia
          </a>
        </div>

        <div class="navbar-search">
          <div class="search-container">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (keyup.enter)="search()"
              placeholder="Szukaj gry..."
              class="search-input"
            >
            <button (click)="search()" class="search-btn">🔍</button>
          </div>
        </div>

        <div class="navbar-auth">
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
      padding: 1rem 2rem;
      background: linear-gradient(180deg, rgba(20, 20, 35, 0.98) 0%, rgba(15, 15, 28, 0.95) 100%);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar-brand .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: white;
    }

    .logo-icon { font-size: 1.75rem; }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #8a2be2 0%, #00d4aa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Burger button - hidden on desktop */
    .burger-btn {
      display: none;
      flex-direction: column;
      justify-content: space-around;
      width: 30px;
      height: 24px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      z-index: 1002;
    }

    .burger-btn span {
      width: 30px;
      height: 3px;
      background: #b0b0c0;
      border-radius: 3px;
      transition: all 0.3s ease;
    }

    .burger-btn.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 7px); }
    .burger-btn.active span:nth-child(2) { opacity: 0; }
    .burger-btn.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -7px); }

    /* Desktop navbar content */
    .navbar-content {
      display: flex;
      align-items: center;
      flex: 1;
      justify-content: space-between;
    }

    .navbar-menu {
      display: flex;
      gap: 0.5rem;
      margin-left: 2rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.2rem;
      border-radius: 10px;
      text-decoration: none;
      color: #b0b0c0;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .nav-link:hover { background: rgba(138, 43, 226, 0.15); color: #ffffff; }
    .nav-link.active { background: rgba(138, 43, 226, 0.25); color: #b47cff; }
    .nav-icon { font-size: 1.1rem; }

    .navbar-search {
      flex: 1;
      max-width: 400px;
      margin: 0 2rem;
    }

    .search-container {
      display: flex;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .search-container:focus-within {
      border-color: rgba(138, 43, 226, 0.5);
      box-shadow: 0 0 20px rgba(138, 43, 226, 0.2);
    }

    .search-input {
      flex: 1;
      padding: 0.75rem 1rem;
      background: transparent;
      border: none;
      color: white;
      font-size: 0.95rem;
      outline: none;
      min-width: 0;
    }

    .search-input::placeholder { color: #666680; }

    .search-btn {
      padding: 0.75rem 1rem;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      transition: transform 0.2s ease;
    }

    .search-btn:hover { transform: scale(1.1); }

    .navbar-auth {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .admin-link {
      padding: 0.6rem 1.2rem;
      border-radius: 10px;
      text-decoration: none;
      color: #b0b0c0;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .admin-link:hover, .admin-link.active {
      background: rgba(138, 43, 226, 0.2);
      color: #b47cff;
    }

    .logout-btn {
      padding: 0.6rem 1.2rem;
      border-radius: 10px;
      background: rgba(220, 53, 69, 0.2);
      border: 1px solid rgba(220, 53, 69, 0.3);
      color: #ff6b7a;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .logout-btn:hover { background: rgba(220, 53, 69, 0.3); }

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
        max-width: 320px;
        height: 100vh;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        padding: 5rem 1.5rem 2rem;
        background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
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
        gap: 0.5rem;
      }

      .nav-link {
        padding: 1rem;
        font-size: 1.1rem;
      }

      .navbar-search {
        margin: 0;
        max-width: 100%;
      }

      .navbar-auth {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
      }

      .admin-link, .logout-btn {
        text-align: center;
        padding: 1rem;
      }

      .menu-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1000;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
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
