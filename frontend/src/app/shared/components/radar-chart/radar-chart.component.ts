import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomRating } from '../../../core/services/api.service';

interface RadarAxis {
  label: string;
  value: number;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  textAnchor: 'start' | 'middle' | 'end';
}

interface GridPolygon {
  points: string;
  level: number;
}

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="radar-container" *ngIf="axes.length >= 3">
      <svg class="radar-svg" viewBox="0 0 360 360">
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--accent-color)" stop-opacity="0.35" />
            <stop offset="100%" stop-color="var(--accent-color)" stop-opacity="0.08" />
          </radialGradient>
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Concentric Grid Polygons -->
        <polygon
          *ngFor="let grid of gridPolygons"
          [attr.points]="grid.points"
          class="grid-polygon"
          [class.outer-grid]="grid.level === 10"
        />

        <!-- Axis Lines -->
        <line
          *ngFor="let axis of outerPoints"
          [attr.x1]="centerX"
          [attr.y1]="centerY"
          [attr.x2]="axis.x"
          [attr.y2]="axis.y"
          class="axis-line"
        />

        <!-- Level Indicator Labels (on top axis) -->
        <text [attr.x]="centerX + 4" [attr.y]="centerY - (radius * 0.5) + 3" class="level-label">5</text>
        <text [attr.x]="centerX + 4" [attr.y]="centerY - radius + 3" class="level-label">10</text>

        <!-- Data Polygon (Filled Area) -->
        <polygon
          [attr.points]="dataPolygonPoints"
          class="data-polygon"
          fill="url(#radarGlow)"
        />

        <!-- Data Polygon Outline -->
        <polygon
          [attr.points]="dataPolygonPoints"
          class="data-outline"
          filter="url(#glowEffect)"
        />

        <!-- Data Points (Dots on vertices) -->
        <g *ngFor="let axis of axes">
          <circle
            [attr.cx]="axis.x"
            [attr.cy]="axis.y"
            r="4.5"
            class="data-dot"
          />
          <circle
            [attr.cx]="axis.x"
            [attr.cy]="axis.y"
            r="2"
            class="data-dot-inner"
          />
        </g>

        <!-- Axis Labels -->
        <text
          *ngFor="let axis of axes"
          [attr.x]="axis.labelX"
          [attr.y]="axis.labelY"
          [attr.text-anchor]="axis.textAnchor"
          class="axis-label"
        >
          <tspan class="label-name">{{ axis.label }}</tspan>
          <tspan class="label-score" dx="4">{{ axis.value.toFixed(1) }}</tspan>
        </text>
      </svg>
    </div>
  `,
  styles: [`
    .radar-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      max-width: 380px;
      margin: 0 auto;
      user-select: none;
    }

    .radar-svg {
      width: 100%;
      height: auto;
      overflow: visible;
    }

    .grid-polygon {
      fill: none;
      stroke: var(--border-color);
      stroke-width: 1;
      stroke-dasharray: 2 3;
      opacity: 0.6;
    }

    .grid-polygon.outer-grid {
      stroke-dasharray: none;
      stroke-width: 1.2;
      opacity: 0.9;
    }

    .axis-line {
      stroke: var(--border-color);
      stroke-width: 1;
      opacity: 0.5;
    }

    .level-label {
      font-size: 8px;
      font-family: var(--font-sans);
      fill: var(--text-muted);
      opacity: 0.5;
      font-weight: 600;
    }

    .data-polygon {
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .data-outline {
      fill: none;
      stroke: var(--accent-color);
      stroke-width: 2.2;
      stroke-linejoin: round;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .data-dot {
      fill: var(--card-bg);
      stroke: var(--accent-color);
      stroke-width: 2;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .data-dot-inner {
      fill: var(--accent-color);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .axis-label {
      font-family: var(--font-sans);
      font-size: 10.5px;
      dominant-baseline: central;
    }

    .label-name {
      fill: var(--text-color);
      font-weight: 500;
    }

    .label-score {
      fill: var(--accent-color);
      font-weight: 700;
      font-size: 10px;
    }
  `]
})
export class RadarChartComponent implements OnChanges {
  @Input() storyRating: number = 0;
  @Input() musicRating: number = 0;
  @Input() graphicsRating: number = 0;
  @Input() optimizationRating: number = 0;
  @Input() gameplayRating: number = 0;
  @Input() customRatings: CustomRating[] = [];

  readonly centerX = 180;
  readonly centerY = 180;
  readonly radius = 110;

  axes: RadarAxis[] = [];
  outerPoints: { x: number; y: number }[] = [];
  gridPolygons: GridPolygon[] = [];
  dataPolygonPoints = '';

  ngOnChanges(changes: SimpleChanges): void {
    this.computeRadar();
  }

  private computeRadar(): void {
    const rawItems: { label: string; value: number }[] = [
      { label: 'Fabuła', value: this.storyRating || 0 },
      { label: 'Muzyka', value: this.musicRating || 0 },
      { label: 'Grafika', value: this.graphicsRating || 0 },
      { label: 'Optymalizacja', value: this.optimizationRating || 0 },
      { label: 'Gameplay', value: this.gameplayRating || 0 }
    ];

    if (this.customRatings && this.customRatings.length > 0) {
      for (const cr of this.customRatings) {
        if (cr.scaleName && cr.value !== undefined) {
          rawItems.push({ label: cr.scaleName, value: cr.value });
        }
      }
    }

    const total = rawItems.length;
    if (total < 3) return;

    const angleStep = (Math.PI * 2) / total;
    // Start from top (-PI / 2)
    const startAngle = -Math.PI / 2;

    // 1. Grid Polygons (levels 2.5, 5, 7.5, 10)
    const levels = [2.5, 5, 7.5, 10];
    this.gridPolygons = levels.map((lvl) => {
      const r = (lvl / 10) * this.radius;
      const pts = rawItems.map((_, i) => {
        const angle = startAngle + i * angleStep;
        const x = this.centerX + r * Math.cos(angle);
        const y = this.centerY + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
      return { points: pts, level: lvl };
    });

    // 2. Outer points for axis lines
    this.outerPoints = rawItems.map((_, i) => {
      const angle = startAngle + i * angleStep;
      return {
        x: Number((this.centerX + this.radius * Math.cos(angle)).toFixed(1)),
        y: Number((this.centerY + this.radius * Math.sin(angle)).toFixed(1))
      };
    });

    // 3. Data points & axis labels
    const dataPoints: string[] = [];
    this.axes = rawItems.map((item, i) => {
      const angle = startAngle + i * angleStep;
      const valRatio = Math.max(0, Math.min(10, item.value)) / 10;
      const dataR = valRatio * this.radius;

      const dataX = Number((this.centerX + dataR * Math.cos(angle)).toFixed(1));
      const dataY = Number((this.centerY + dataR * Math.sin(angle)).toFixed(1));
      dataPoints.push(`${dataX},${dataY}`);

      // Label positioning (outside outer polygon)
      const labelDistance = this.radius + 24;
      const labelX = this.centerX + labelDistance * Math.cos(angle);
      const labelY = this.centerY + labelDistance * Math.sin(angle);

      // Determine text-anchor based on cos(angle)
      const cos = Math.cos(angle);
      let textAnchor: 'start' | 'middle' | 'end' = 'middle';
      if (cos > 0.3) {
        textAnchor = 'start';
      } else if (cos < -0.3) {
        textAnchor = 'end';
      }

      return {
        label: item.label,
        value: item.value,
        x: dataX,
        y: dataY,
        labelX: Number(labelX.toFixed(1)),
        labelY: Number(labelY.toFixed(1)),
        textAnchor
      };
    });

    this.dataPolygonPoints = dataPoints.join(' ');
  }
}
