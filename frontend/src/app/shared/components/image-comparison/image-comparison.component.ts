import { Component, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-comparison',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="comparison-container" #container (mousedown)="startDrag($event)" (touchstart)="startDrag($event)">
      <!-- Base Image (After Image underneath - right side) -->
      <div class="image-wrapper base-image">
        <img [src]="getImageUrl(afterImage)" [alt]="labelAfter" draggable="false" />
      </div>

      <!-- Overlay Image (Before Image on top - left side) -->
      <div class="image-wrapper overlay-image" [style.clip-path]="'inset(0 ' + (100 - position) + '% 0 0)'">
        <img [src]="getImageUrl(beforeImage)" [alt]="labelBefore" draggable="false" />
      </div>

      <!-- Floating Badges -->
      <span class="badge badge-before" [class.badge-hidden]="position <= 8">{{ labelBefore }}</span>
      <span class="badge badge-after" [class.badge-hidden]="position >= 92">{{ labelAfter }}</span>

      <!-- Slider Handle -->
      <div class="slider-handle" [style.left.%]="position">
        <div class="handle-line"></div>
        <div class="handle-grip">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div class="handle-line"></div>
      </div>
    </div>
  `,
  styles: [`
    .comparison-container {
      position: relative;
      width: 100%;
      max-width: 100%;
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

    .image-wrapper {
      width: 100%;
      position: relative;
      display: block;
    }

    .image-wrapper img {
      width: 100%;
      height: auto;
      display: block;
      pointer-events: none;
    }

    .overlay-image {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      pointer-events: none;
    }

    .overlay-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .badge {
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

    .badge-before {
      left: 16px;
    }

    .badge-after {
      right: 16px;
    }

    .badge.badge-hidden {
      opacity: 0;
      transform: translateY(4px);
    }

    .slider-handle {
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

    .handle-line {
      width: 2px;
      flex: 1;
      background: #ffffff;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
    }

    .handle-grip {
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

    .comparison-container:hover .handle-grip {
      transform: scale(1.1);
    }
  `]
})
export class ImageComparisonComponent {
  @Input() beforeImage: string = '';
  @Input() afterImage: string = '';
  @Input() labelBefore: string = 'Przed';
  @Input() labelAfter: string = 'Po';

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  position = 50; // percentage
  private isDragging = false;

  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return url;
    return '/uploads/' + url;
  }

  startDrag(event: MouseEvent | TouchEvent): void {
    this.isDragging = true;
    this.updatePosition(event);
    event.preventDefault();
  }

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onDrag(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;
    this.updatePosition(event);
  }

  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  stopDrag(): void {
    this.isDragging = false;
  }

  private updatePosition(event: MouseEvent | TouchEvent): void {
    if (!this.containerRef) return;
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const offsetX = clientX - rect.left;
    const percentage = (offsetX / rect.width) * 100;
    this.position = Math.max(0, Math.min(100, percentage));
  }
}
