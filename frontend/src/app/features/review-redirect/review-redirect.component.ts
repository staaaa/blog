import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-review-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="redirect-container">
      <div class="spinner"></div>
      <p>Przekierowywanie do recenzji gry...</p>
    </div>
  `,
  styles: [`
    .redirect-container {
      text-align: center;
      padding: 6rem 2rem;
      color: var(--text-muted);
    }
    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top: 4px solid var(--accent-color);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class ReviewRedirectComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  ngOnInit(): void {
    const id = parseInt(this.route.snapshot.paramMap.get('id') || '');
    if (id) {
      this.api.getReview(id).subscribe({
        next: (review) => {
          if (review.game && review.game.slug) {
            this.router.navigate(['/game', review.game.slug], {
              queryParams: { reviewer: review.userId }
            });
          } else {
            this.router.navigate(['/']);
          }
        },
        error: () => {
          this.router.navigate(['/']);
        }
      });
    } else {
      this.router.navigate(['/']);
    }
  }
}
