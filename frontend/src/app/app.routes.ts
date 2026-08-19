import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'game/:slug',
    loadComponent: () => import('./features/game-detail/game-detail.component').then(m => m.GameDetailComponent)
  },
  {
    path: 'review/:id',
    loadComponent: () => import('./features/review-redirect/review-redirect.component').then(m => m.ReviewRedirectComponent)
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
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () => import('./features/account/account-settings/account-settings.component').then(m => m.AccountSettingsComponent)
  },
  {
    path: 'account/favorites',
    canActivate: [authGuard],
    loadComponent: () => import('./features/account/favorites/favorites.component').then(m => m.FavoritesComponent)
  },
  {
    path: 'admin',
    canActivate: [roleGuard('reviewer')],
    loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'admin/game/new',
    canActivate: [roleGuard('reviewer')],
    loadComponent: () => import('./features/admin/game-editor/game-editor.component').then(m => m.GameEditorComponent)
  },
  {
    path: 'admin/game/:id/edit',
    canActivate: [roleGuard('reviewer')],
    loadComponent: () => import('./features/admin/game-editor/game-editor.component').then(m => m.GameEditorComponent)
  },
  {
    path: 'admin/review/new',
    canActivate: [roleGuard('reviewer')],
    loadComponent: () => import('./features/admin/review-editor/review-editor.component').then(m => m.ReviewEditorComponent)
  },
  {
    path: 'admin/review/new/:gameId',
    canActivate: [roleGuard('reviewer')],
    loadComponent: () => import('./features/admin/review-editor/review-editor.component').then(m => m.ReviewEditorComponent)
  },
  {
    path: 'admin/review/:id',
    canActivate: [roleGuard('reviewer')],
    loadComponent: () => import('./features/admin/review-editor/review-editor.component').then(m => m.ReviewEditorComponent)
  },
  {
    path: 'admin/review/:id/edit',
    canActivate: [roleGuard('reviewer')],
    loadComponent: () => import('./features/admin/review-editor/review-editor.component').then(m => m.ReviewEditorComponent)
  },
  {
    path: 'admin/users',
    canActivate: [roleGuard('admin')],
    loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
