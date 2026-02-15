import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'review/:id',
    loadComponent: () => import('./features/review-detail/review-detail.component').then(m => m.ReviewDetailComponent)
  },
  {
    path: 'genres',
    loadComponent: () => import('./features/genres/genres.component').then(m => m.GenresComponent)
  },
  {
    path: 'genres/:slug',
    loadComponent: () => import('./features/genres/genres.component').then(m => m.GenresComponent)
  },
  {
    path: 'series',
    loadComponent: () => import('./features/series/series.component').then(m => m.SeriesComponent)
  },
  {
    path: 'series/:slug',
    loadComponent: () => import('./features/series/series.component').then(m => m.SeriesComponent)
  },
  {
    path: 'studios',
    loadComponent: () => import('./features/studios/studios.component').then(m => m.StudiosComponent)
  },
  {
    path: 'studios/:slug',
    loadComponent: () => import('./features/studios/studios.component').then(m => m.StudiosComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'admin/review/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/review-editor/review-editor.component').then(m => m.ReviewEditorComponent)
  },
  {
    path: 'admin/review/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/review-editor/review-editor.component').then(m => m.ReviewEditorComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
