import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id: number;
  title: string;
  gameTitle: string;
  content: string;
  hardwareSpecs: string;
  storyRating: number;
  musicRating: number;
  graphicsRating: number;
  optimizationRating: number;
  gameplayRating: number;
  averageRating: number;
  coverImage: string | null;
  genres: Category[];
  series: Category | null;
  studio: Category | null;
  customRatings: CustomRating[];
  createdAt: string;
  updatedAt: string;
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

export interface PaginatedResponse<T> {
  reviews: T[];
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
  reviews: Review[];
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

  // Reviews
  getReviews(page = 1, limit = 10): Observable<PaginatedResponse<Review>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginatedResponse<Review>>(`${this.baseUrl}/reviews`, { params });
  }

  getReview(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/reviews/${id}`);
  }

  searchReviews(query: string, page = 1, limit = 10): Observable<PaginatedResponse<Review>> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginatedResponse<Review>>(`${this.baseUrl}/reviews/search`, { params });
  }

  createReview(review: Partial<Review> & { genreIds?: number[], customRatings?: CustomRating[] }): Observable<Review> {
    return this.http.post<Review>(`${this.baseUrl}/reviews`, review);
  }

  updateReview(id: number, review: Partial<Review> & { genreIds?: number[], customRatings?: CustomRating[] }): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/reviews/${id}`, review);
  }

  deleteReview(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/reviews/${id}`);
  }

  // Genres
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

  // Series
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

  // Studios
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

  // Upload
  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ url: string }>(`${this.baseUrl}/upload/image`, formData);
  }
}
