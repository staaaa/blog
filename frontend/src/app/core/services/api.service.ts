import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type UserRole = 'admin' | 'reviewer' | 'reader';
export type GameStatus = 'platyna' | 'main_story' | 'in_progress' | 'abandoned';

export interface PlatformLink {
  name: string;
  url?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  role: UserRole;
  displayName?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface CustomRating {
  id?: number;
  scaleName: string;
  value: number;
}

export interface ReviewerSummary {
  reviewId: number;
  userId: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  averageRating: number;
  isDraft?: boolean;
  updatedAt?: string;
}

export interface Comment {
  id: number;
  reviewId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author?: {
    id: number;
    username: string;
    displayName?: string;
    avatarUrl?: string | null;
    role: UserRole;
  };
}

export interface Game {
  id: number;
  gameTitle: string;
  slug: string;
  coverImage: string | null;
  releaseDate: string | null;
  soundtrackUrl: string | null;
  platforms: PlatformLink[];
  genres: Category[];
  series: Category | null;
  studio: Category | null;
  createdBy?: UserProfile;
  storyRating?: number;
  musicRating?: number;
  graphicsRating?: number;
  optimizationRating?: number;
  gameplayRating?: number;
  averageRating: number;
  reviewCount: number;
  favoriteCount?: number;
  reviewers?: ReviewerSummary[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  gameId: number;
  userId: number;
  title: string;
  content: string;
  hardwareSpecs: string | null;
  storyRating: number;
  musicRating: number;
  graphicsRating: number;
  optimizationRating: number;
  gameplayRating: number;
  averageRating: number;
  isDraft: boolean;
  pros: string[];
  cons: string[];
  gameStatus: GameStatus;
  playtimeHours: number;
  customRatings: CustomRating[];
  author?: UserProfile;
  game?: Game;
  likeCount?: number;
  isLiked?: boolean;
  comments?: Comment[];
  commentsCount?: number;
  // Legacy fields fallback
  gameTitle?: string;
  coverImage?: string | null;
  releaseDate?: string | null;
  soundtrackUrl?: string | null;
  platforms?: PlatformLink[];
  genres?: Category[];
  series?: Category | null;
  studio?: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface GameAverages {
  storyRating: number;
  musicRating: number;
  graphicsRating: number;
  optimizationRating: number;
  gameplayRating: number;
  averageRating: number;
  reviewCount: number;
}

export interface GameDetailResponse {
  game: Game;
  averages: GameAverages;
  reviewers: ReviewerSummary[];
  selectedReview: Review | null;
  favoriteCount?: number;
  isFavorite?: boolean;
  isRead?: boolean;
}

export interface PaginatedResponse<T> {
  games?: T[];
  reviews?: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CategoryWithReviews {
  genre?: Category;
  series?: Category;
  studio?: Category;
  games?: Game[];
  reviews?: Game[] | Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  // ========================
  // Games
  // ========================

  getGames(page = 1, limit = 10, sort = 'newest', includeEmpty = false, onlyWithReviews = false): Observable<PaginatedResponse<Game>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sort', sort);
    if (includeEmpty) {
      params = params.set('includeEmpty', 'true');
    }
    if (onlyWithReviews) {
      params = params.set('onlyWithReviews', 'true');
    }
    return this.http.get<PaginatedResponse<Game>>(`${this.baseUrl}/games`, { params });
  }

  getGame(slug: string, reviewerId?: number, reviewId?: number): Observable<GameDetailResponse> {
    let params = new HttpParams();
    if (reviewerId) {
      params = params.set('reviewerId', reviewerId.toString());
    }
    if (reviewId) {
      params = params.set('reviewId', reviewId.toString());
    }
    return this.http.get<GameDetailResponse>(`${this.baseUrl}/games/${slug}`, { params });
  }

  getGameById(id: number): Observable<GameDetailResponse> {
    return this.http.get<GameDetailResponse>(`${this.baseUrl}/games/${id}`);
  }

  createGame(game: Partial<Game> & { genreIds?: number[], seriesId?: number | null, studioId?: number | null }): Observable<Game> {
    return this.http.post<Game>(`${this.baseUrl}/games`, game);
  }

  updateGame(id: number, game: Partial<Game> & { genreIds?: number[], seriesId?: number | null, studioId?: number | null }): Observable<Game> {
    return this.http.put<Game>(`${this.baseUrl}/games/${id}`, game);
  }

  deleteGame(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/games/${id}`);
  }

  searchGames(query: string, page = 1, limit = 10): Observable<PaginatedResponse<Game>> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginatedResponse<Game>>(`${this.baseUrl}/games/search`, { params });
  }

  // ========================
  // Reviews
  // ========================

  getReview(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/reviews/${id}`);
  }

  getMyReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews/my`);
  }

  createReview(review: Partial<Review> & { customRatings?: CustomRating[] }): Observable<Review> {
    return this.http.post<Review>(`${this.baseUrl}/reviews`, review);
  }

  updateReview(id: number, review: Partial<Review> & { customRatings?: CustomRating[] }): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/reviews/${id}`, review);
  }

  deleteReview(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/reviews/${id}`);
  }

  // ========================
  // Review Likes & Comments
  // ========================

  toggleReviewLike(reviewId: number): Observable<{ liked: boolean; likeCount: number; message: string }> {
    return this.http.post<{ liked: boolean; likeCount: number; message: string }>(`${this.baseUrl}/reviews/${reviewId}/like`, {});
  }

  getComments(reviewId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/reviews/${reviewId}/comments`);
  }

  addComment(reviewId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/reviews/${reviewId}/comments`, { content });
  }

  deleteComment(commentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/reviews/comments/${commentId}`);
  }

  // ========================
  // Account (Reader & Reviewer & Admin)
  // ========================

  updateProfile(data: { displayName?: string; avatarUrl?: string }): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/account/profile`, data);
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/account/password`, data);
  }

  getFavorites(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.baseUrl}/account/favorites`);
  }

  toggleFavorite(gameId: number): Observable<{ favorited: boolean; favoriteCount: number; message: string }> {
    return this.http.post<{ favorited: boolean; favoriteCount: number; message: string }>(`${this.baseUrl}/account/favorites/${gameId}`, {});
  }

  getReadMarks(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/account/read`);
  }

  toggleReadMark(reviewId: number): Observable<{ isRead: boolean; message: string }> {
    return this.http.post<{ isRead: boolean; message: string }>(`${this.baseUrl}/account/read/${reviewId}`, {});
  }

  // ========================
  // Admin Management
  // ========================

  getUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.baseUrl}/admin/users`);
  }

  createUser(data: { username: string; password: string; role: UserRole; displayName?: string }): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.baseUrl}/admin/users`, data);
  }

  updateUserRole(userId: number, role: UserRole): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/admin/users/${userId}/role`, { role });
  }

  deleteUser(userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/admin/users/${userId}`);
  }

  // ========================
  // Categories (Genres, Series, Studios)
  // ========================

  getGenres(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/genres`);
  }

  getGenreReviews(slug: string, page = 1, limit = 10): Observable<CategoryWithReviews> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<CategoryWithReviews>(`${this.baseUrl}/genres/${slug}/reviews`, { params });
  }

  createGenre(name: string): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/genres`, { name });
  }

  deleteGenre(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/genres/${id}`);
  }

  getSeries(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/series`);
  }

  getSeriesReviews(slug: string, page = 1, limit = 10): Observable<CategoryWithReviews> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<CategoryWithReviews>(`${this.baseUrl}/series/${slug}/reviews`, { params });
  }

  createSeries(name: string): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/series`, { name });
  }

  deleteSeries(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/series/${id}`);
  }

  getStudios(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/studios`);
  }

  getStudioReviews(slug: string, page = 1, limit = 10): Observable<CategoryWithReviews> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<CategoryWithReviews>(`${this.baseUrl}/studios/${slug}/reviews`, { params });
  }

  createStudio(name: string): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/studios`, { name });
  }

  deleteStudio(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/studios/${id}`);
  }

  // ========================
  // Uploads & Maintenance
  // ========================

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ url: string }>(`${this.baseUrl}/upload/image`, formData);
  }

  cleanupUploads(): Observable<{ deletedCount: number; freedBytes: number; freedMb: string; deletedFiles: string[] }> {
    return this.http.post<{ deletedCount: number; freedBytes: number; freedMb: string; deletedFiles: string[] }>(`${this.baseUrl}/upload/cleanup`, {});
  }
}
