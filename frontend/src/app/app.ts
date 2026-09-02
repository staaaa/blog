import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <footer class="app-footer">
      <div class="footer-container">
        <div class="footer-top">
          <div class="footer-brand">
            <span class="footer-logo">Giercujemy</span>
            <p class="footer-tagline">Niezależny blog z recenzjami gier wideo. Giercujemy z pasją od dwójki kuzynów.</p>
          </div>
          <div class="footer-links">
            <span class="footer-heading">Nawigacja</span>
            <a routerLink="/" class="footer-link">Strona główna</a>
            <a routerLink="/genres" class="footer-link">Gatunki</a>
            <a routerLink="/series" class="footer-link">Serie gier</a>
            <a routerLink="/studios" class="footer-link">Studia deweloperskie</a>
            <a routerLink="/search" class="footer-link">Wyszukiwarka</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© {{ currentYear }} <strong>Giercujemy</strong>. Rzetelne recenzje gier.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .main-content {
        min-height: calc(100vh - 70px);
      }

      .app-footer {
        background-color: var(--header-bg);
        border-top: 1px solid var(--border-color);
        padding: 3rem 1.5rem 1.5rem;
        margin-top: 4rem;
        transition: background-color 0.25s ease, border-color 0.25s ease;
      }

      .footer-container {
        max-width: 1160px;
        margin: 0 auto;
      }

      .footer-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid var(--border-color);
      }

      .footer-brand {
        max-width: 420px;
      }

      .footer-logo {
        font-size: 1.4rem;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: var(--accent-color);
        display: inline-block;
        margin-bottom: 0.5rem;
      }

      .footer-tagline {
        color: var(--text-muted);
        font-size: 0.9rem;
        line-height: 1.5;
      }

      .footer-links {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .footer-heading {
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-color);
        margin-bottom: 0.25rem;
      }

      .footer-link {
        color: var(--text-muted);
        text-decoration: none;
        font-size: 0.88rem;
        transition: color 0.2s ease;
      }

      .footer-link:hover {
        color: var(--accent-color);
      }

      .footer-bottom {
        padding-top: 1.5rem;
        text-align: center;
        color: var(--text-muted);
        font-size: 0.85rem;
      }

      .footer-bottom strong {
        color: var(--text-color);
      }

      @media (max-width: 768px) {
        .footer-top {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class App {
  title = 'Giercujemy – Recenzje gier';
  currentYear = new Date().getFullYear();
}
