import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pros-cons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pros-cons-container" *ngIf="hasItems">
      <!-- Pros Column -->
      <div class="card pros-card" *ngIf="pros && pros.length > 0">
        <div class="card-header">
          <div class="icon-badge pros-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3 class="card-title">Plusy</h3>
        </div>
        <ul class="items-list">
          <li *ngFor="let item of pros" class="item pros-item">
            <span class="bullet pros-bullet">+</span>
            <span class="text">{{ item }}</span>
          </li>
        </ul>
      </div>

      <!-- Cons Column -->
      <div class="card cons-card" *ngIf="cons && cons.length > 0">
        <div class="card-header">
          <div class="icon-badge cons-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <h3 class="card-title">Minusy</h3>
        </div>
        <ul class="items-list">
          <li *ngFor="let item of cons" class="item cons-item">
            <span class="bullet cons-bullet">−</span>
            <span class="text">{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .pros-cons-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
      width: 100%;
      margin: 0 auto 2rem auto;
      box-sizing: border-box;
    }

    .card {
      background-color: var(--card-bg);
      border-radius: 12px;
      padding: 1.25rem;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 12px var(--shadow);
      display: flex;
      flex-direction: column;
      width: 100%;
      box-sizing: border-box;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }

    .icon-badge {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background-color: var(--bg-color);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
    }

    .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      font-family: var(--font-sans);
      color: var(--text-color);
      letter-spacing: 0.3px;
      margin: 0;
      text-transform: uppercase;
    }

    .items-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      font-size: 0.95rem;
      line-height: 1.5;
      font-family: var(--font-serif);
      color: var(--text-color);
    }

    .bullet {
      font-family: var(--font-sans);
      font-weight: 700;
      font-size: 1rem;
      line-height: 1;
      flex-shrink: 0;
      margin-top: 2px;
      width: 20px;
      height: 20px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
    }

    .text {
      flex: 1;
    }

    @media (max-width: 768px) {
      .pros-cons-container {
        grid-template-columns: 1fr;
        gap: 1rem;
        width: 100%;
        margin: 0 auto 1.5rem auto;
      }
      .card {
        border-radius: 10px;
        border: 1px solid var(--border-color);
        padding: 1rem;
      }
      .item {
        font-size: 0.78rem;
        gap: 0.5rem;
      }
      .card-title {
        font-size: 0.88rem;
      }
    }
  `]
})
export class ProsConsComponent {
  @Input() pros: string[] = [];
  @Input() cons: string[] = [];

  get hasItems(): boolean {
    return (this.pros && this.pros.length > 0) || (this.cons && this.cons.length > 0);
  }
}
