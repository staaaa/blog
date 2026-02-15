import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spoiler-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spoiler-container" [class.revealed]="isRevealed" (click)="reveal()">
      <div class="spoiler-overlay" *ngIf="!isRevealed">
        <span class="spoiler-icon">🔒</span>
        <span class="spoiler-text">Kliknij, aby odsłonić spoiler</span>
      </div>
      <div class="spoiler-content" [innerHTML]="content"></div>
    </div>
  `,
  styles: [`
    .spoiler-container {
      position: relative;
      margin: 1rem 0;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .spoiler-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      z-index: 10;
      backdrop-filter: blur(8px);
    }

    .spoiler-icon {
      font-size: 2rem;
    }

    .spoiler-text {
      color: #a0a0a0;
      font-size: 0.9rem;
    }

    .spoiler-content {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }

    .spoiler-container:not(.revealed) .spoiler-content {
      filter: blur(10px);
      user-select: none;
    }

    .spoiler-container.revealed .spoiler-overlay {
      display: none;
    }

    .spoiler-container.revealed {
      cursor: default;
    }

    .spoiler-container:not(.revealed):hover .spoiler-overlay {
      background: linear-gradient(135deg, #1a1a2e 0%, #1f2f4e 100%);
    }
  `]
})
export class SpoilerBlockComponent {
  @Input() content: string = '';
  isRevealed = false;

  reveal(): void {
    this.isRevealed = true;
  }
}
