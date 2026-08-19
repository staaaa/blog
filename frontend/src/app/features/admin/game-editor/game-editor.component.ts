import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Category, Game, PlatformLink } from '../../../core/services/api.service';

interface PlatformOption {
  name: string;
  selected: boolean;
  url: string;
}

@Component({
  selector: 'app-game-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-container">
      <header class="editor-header">
        <h1>{{ isEdit ? 'Edytuj dane gry' : 'Dodaj nową grę' }}</h1>
        <p class="editor-subtitle">
          Dodaj tytuł gry i jej parametry. Po dodaniu gry recenzenci będą mogli pisać dla niej recenzje.
        </p>
      </header>

      <form (ngSubmit)="save()" class="editor-form">
        <!-- Basic Info -->
        <div class="form-section">
          <h2>Podstawowe informacje</h2>

          <div class="form-group">
            <label for="gameTitle">Tytuł gry *</label>
            <input
              type="text"
              id="gameTitle"
              [(ngModel)]="game.gameTitle"
              name="gameTitle"
              required
              placeholder="np. Silent Hill 2, Cyberpunk 2077..."
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="releaseDate">Data premiery</label>
              <input
                type="date"
                id="releaseDate"
                [(ngModel)]="game.releaseDate"
                name="releaseDate"
              >
            </div>

            <div class="form-group">
              <label for="soundtrackUrl">Link do ścieżki dźwiękowej (YouTube)</label>
              <input
                type="url"
                id="soundtrackUrl"
                [(ngModel)]="game.soundtrackUrl"
                name="soundtrackUrl"
                placeholder="https://www.youtube.com/watch?v=..."
              >
            </div>
          </div>

          <!-- Cover Image -->
          <div class="form-group">
            <label>Okładka gry</label>
            <div class="cover-upload">
              <input
                type="text"
                [(ngModel)]="game.coverImage"
                name="coverImage"
                placeholder="Wklej URL zdjęcia lub prześlij plik..."
              >
              <input
                type="file"
                #fileInput
                (change)="uploadCover($event)"
                accept="image/*"
                style="display: none"
              >
              <button type="button" (click)="fileInput.click()" class="upload-btn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Prześlij plik
              </button>
            </div>
            <div class="cover-preview" *ngIf="game.coverImage">
              <img [src]="getImageUrl(game.coverImage)" alt="Podgląd okładki">
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div class="form-section">
          <h2>Kategorie i relacje</h2>

          <!-- Genres -->
          <div class="form-group">
            <label>Gatunki</label>
            <div class="checkbox-group">
              <label *ngFor="let genre of genres" class="checkbox-label">
                <input
                  type="checkbox"
                  [checked]="isGenreSelected(genre.id)"
                  (change)="toggleGenre(genre.id)"
                >
                <span>{{ genre.name }}</span>
              </label>
            </div>
            <div class="inline-add">
              <input
                type="text"
                [(ngModel)]="newGenreName"
                name="newGenreName"
                placeholder="Nowy gatunek..."
              >
              <button type="button" (click)="addGenre()">+ Dodaj</button>
            </div>
          </div>

          <div class="form-row">
            <!-- Series -->
            <div class="form-group">
              <label for="seriesId">Seria</label>
              <select id="seriesId" [(ngModel)]="game.seriesId" name="seriesId">
                <option [ngValue]="null">Brak serii</option>
                <option *ngFor="let s of series" [ngValue]="s.id">{{ s.name }}</option>
              </select>
              <div class="inline-add">
                <input
                  type="text"
                  [(ngModel)]="newSeriesName"
                  name="newSeriesName"
                  placeholder="Nowa seria..."
                >
                <button type="button" (click)="addSeries()">+ Dodaj</button>
              </div>
            </div>

            <!-- Studio -->
            <div class="form-group">
              <label for="studioId">Studio / Deweloper</label>
              <select id="studioId" [(ngModel)]="game.studioId" name="studioId">
                <option [ngValue]="null">Brak studia</option>
                <option *ngFor="let st of studios" [ngValue]="st.id">{{ st.name }}</option>
              </select>
              <div class="inline-add">
                <input
                  type="text"
                  [(ngModel)]="newStudioName"
                  name="newStudioName"
                  placeholder="Nowe studio..."
                >
                <button type="button" (click)="addStudio()">+ Dodaj</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Platforms -->
        <div class="form-section">
          <h2>Dostępne platformy i linki do sklepów</h2>
          <div class="platforms-list">
            <div *ngFor="let platform of platformsOptions; let i = index" class="platform-row">
              <label class="platform-checkbox">
                <input type="checkbox" [(ngModel)]="platform.selected" [name]="'plat_sel_' + i">
                <span class="platform-name">{{ platform.name }}</span>
              </label>
              <input
                type="url"
                [(ngModel)]="platform.url"
                [name]="'plat_url_' + i"
                placeholder="Link do sklepu (np. Steam, PS Store)..."
                [disabled]="!platform.selected"
                class="platform-url-input"
              >
            </div>
          </div>

          <div class="inline-add" style="margin-top: 1rem;">
            <input
              type="text"
              [(ngModel)]="customPlatformName"
              name="customPlatformName"
              placeholder="Inna platforma (np. GOG, Epic Games)..."
            >
            <button type="button" (click)="addCustomPlatform()">+ Dodaj platformę</button>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" (click)="cancel()" class="cancel-btn">Anuluj</button>
          <button type="submit" [disabled]="saving" class="save-btn">
            {{ saving ? 'Zapisywanie...' : (isEdit ? 'Zapisz zmiany w grze' : 'Dodaj grę do portalu') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .editor-container {
      max-width: 860px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }

    .editor-header {
      margin-bottom: 2rem;
    }

    .editor-header h1 {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .editor-subtitle {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .form-section {
      background-color: var(--card-bg);
      border-radius: 14px;
      padding: 1.75rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border-color);
    }

    .form-section h2 {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 1.25rem 0;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.45rem;
      color: var(--text-primary);
      font-size: 0.9rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    input[type="text"],
    input[type="date"],
    input[type="url"],
    select {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background-color: var(--input-bg);
      color: var(--text-primary);
      font-family: inherit;
      font-size: 0.95rem;
      transition: border-color 0.2s ease;
    }

    input:focus, select:focus {
      outline: none;
      border-color: var(--accent-color);
    }

    .cover-upload {
      display: flex;
      gap: 0.75rem;
    }

    .upload-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.75rem 1.25rem;
      background-color: var(--bg-color);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .upload-btn:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
    }

    .cover-preview {
      margin-top: 1rem;
      max-height: 240px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border-color);
    }

    .cover-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background-color: var(--bg-color);
      border: 1px solid var(--border-color);
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      user-select: none;
    }

    .checkbox-label input[type="checkbox"] {
      accent-color: var(--accent-color);
    }

    .inline-add {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .inline-add input {
      flex: 1;
      padding: 0.45rem 0.75rem;
      font-size: 0.85rem;
    }

    .inline-add button {
      padding: 0.45rem 0.85rem;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      white-space: nowrap;
    }

    .inline-add button:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
    }

    .platforms-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .platform-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--bg-color);
      padding: 0.6rem 0.85rem;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .platform-checkbox {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      width: 140px;
      flex-shrink: 0;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .platform-url-input {
      flex: 1;
      padding: 0.45rem 0.75rem;
      font-size: 0.85rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .cancel-btn, .save-btn {
      padding: 0.85rem 1.75rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .cancel-btn {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-muted);
    }

    .cancel-btn:hover {
      color: var(--text-primary);
      border-color: var(--text-muted);
    }

    .save-btn {
      background: var(--accent-color);
      border: none;
      color: #ffffff;
    }

    .save-btn:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-2px);
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      .platform-row {
        flex-direction: column;
        align-items: stretch;
      }
      .platform-checkbox {
        width: 100%;
      }
    }
  `]
})
export class GameEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  isEdit = false;
  saving = false;
  gameId: number | null = null;

  game: Partial<Game> & { seriesId?: number | null; studioId?: number | null } = {
    gameTitle: '',
    coverImage: '',
    releaseDate: '',
    soundtrackUrl: '',
    seriesId: null,
    studioId: null
  };

  genres: Category[] = [];
  series: Category[] = [];
  studios: Category[] = [];
  selectedGenreIds: number[] = [];

  newGenreName = '';
  newSeriesName = '';
  newStudioName = '';
  customPlatformName = '';

  platformsOptions: PlatformOption[] = [
    { name: 'PC / Steam', selected: false, url: '' },
    { name: 'PlayStation 5', selected: false, url: '' },
    { name: 'PlayStation 4', selected: false, url: '' },
    { name: 'Xbox Series X|S', selected: false, url: '' },
    { name: 'Xbox One', selected: false, url: '' },
    { name: 'Nintendo Switch', selected: false, url: '' },
    { name: 'Steam Deck', selected: false, url: '' }
  ];

  ngOnInit(): void {
    this.loadCategories();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.isEdit = true;
      this.gameId = parseInt(idParam);
      this.loadGame(this.gameId);
    }
  }

  loadCategories(): void {
    this.api.getGenres().subscribe(g => this.genres = g);
    this.api.getSeries().subscribe(s => this.series = s);
    this.api.getStudios().subscribe(st => this.studios = st);
  }

  loadGame(id: number): void {
    this.api.getGames(1, 100, 'newest', true).subscribe({
      next: (res) => {
        const found = (res.games || []).find(g => g.id === id);
        if (found) {
          this.game = {
            gameTitle: found.gameTitle,
            coverImage: found.coverImage,
            releaseDate: found.releaseDate,
            soundtrackUrl: found.soundtrackUrl,
            seriesId: found.series?.id || null,
            studioId: found.studio?.id || null
          };

          this.selectedGenreIds = (found.genres || []).map(g => g.id);

          if (found.platforms && found.platforms.length > 0) {
            found.platforms.forEach(p => {
              const existing = this.platformsOptions.find(opt => opt.name.toLowerCase() === p.name.toLowerCase());
              if (existing) {
                existing.selected = true;
                existing.url = p.url || '';
              } else {
                this.platformsOptions.push({
                  name: p.name,
                  selected: true,
                  url: p.url || ''
                });
              }
            });
          }
        }
      }
    });
  }

  uploadCover(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.api.uploadImage(file).subscribe({
        next: (res) => this.game.coverImage = res.url,
        error: (err) => alert('Błąd przesyłania okładki: ' + (err.error?.error || err.message))
      });
    }
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return url;
    return '/uploads/' + url;
  }

  isGenreSelected(id: number): boolean {
    return this.selectedGenreIds.includes(id);
  }

  toggleGenre(id: number): void {
    if (this.selectedGenreIds.includes(id)) {
      this.selectedGenreIds = this.selectedGenreIds.filter(i => i !== id);
    } else {
      this.selectedGenreIds.push(id);
    }
  }

  addGenre(): void {
    if (this.newGenreName.trim()) {
      this.api.createGenre(this.newGenreName.trim()).subscribe({
        next: (g) => {
          this.genres.push(g);
          this.selectedGenreIds.push(g.id);
          this.newGenreName = '';
        }
      });
    }
  }

  addSeries(): void {
    if (this.newSeriesName.trim()) {
      this.api.createSeries(this.newSeriesName.trim()).subscribe({
        next: (s) => {
          this.series.push(s);
          this.game.seriesId = s.id;
          this.newSeriesName = '';
        }
      });
    }
  }

  addStudio(): void {
    if (this.newStudioName.trim()) {
      this.api.createStudio(this.newStudioName.trim()).subscribe({
        next: (st) => {
          this.studios.push(st);
          this.game.studioId = st.id;
          this.newStudioName = '';
        }
      });
    }
  }

  addCustomPlatform(): void {
    const name = this.customPlatformName.trim();
    if (name) {
      if (!this.platformsOptions.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        this.platformsOptions.push({ name, selected: true, url: '' });
      }
      this.customPlatformName = '';
    }
  }

  save(): void {
    if (!this.game.gameTitle?.trim()) {
      alert('Tytuł gry jest wymagany');
      return;
    }

    this.saving = true;

    const selectedPlatforms: PlatformLink[] = this.platformsOptions
      .filter(p => p.selected)
      .map(p => ({
        name: p.name,
        ...(p.url?.trim() ? { url: p.url.trim() } : {})
      }));

    const payload = {
      gameTitle: this.game.gameTitle.trim(),
      coverImage: this.game.coverImage || null,
      releaseDate: this.game.releaseDate || null,
      soundtrackUrl: this.game.soundtrackUrl || null,
      platforms: selectedPlatforms,
      genreIds: this.selectedGenreIds,
      seriesId: this.game.seriesId || null,
      studioId: this.game.studioId || null
    };

    if (this.isEdit && this.gameId) {
      this.api.updateGame(this.gameId, payload).subscribe({
        next: (g) => {
          this.saving = false;
          this.router.navigate(['/game', g.slug]);
        },
        error: (err) => {
          this.saving = false;
          alert('Błąd podczas aktualizacji gry: ' + (err.error?.error || err.message));
        }
      });
    } else {
      this.api.createGame(payload).subscribe({
        next: (g) => {
          this.saving = false;
          this.router.navigate(['/admin/review/new', g.id]);
        },
        error: (err) => {
          this.saving = false;
          alert('Błąd podczas dodawania gry: ' + (err.error?.error || err.message));
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin']);
  }
}
