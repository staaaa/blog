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
        <h1>{{ isEdit ? 'Edytuj Grę' : 'Dodaj Nową Grę do Bazy' }}</h1>
      </header>

      <form (ngSubmit)="save()" class="game-form">
        <!-- Basic Info Section -->
        <section class="form-section">
          <h2>Podstawowe informacje</h2>
          
          <div class="form-group">
            <label for="gameTitle">Tytuł gry *</label>
            <input
              type="text"
              id="gameTitle"
              [(ngModel)]="game.gameTitle"
              name="gameTitle"
              required
              placeholder="np. Silent Hill 2 Remake"
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
              <label for="soundtrackUrl">Link do OST (YouTube)</label>
              <input
                type="url"
                id="soundtrackUrl"
                [(ngModel)]="game.soundtrackUrl"
                name="soundtrackUrl"
                placeholder="https://www.youtube.com/watch?v=..."
              >
            </div>
          </div>

          <!-- Cover Image Upload -->
          <div class="form-group">
            <label>Okładka gry</label>
            <div class="cover-upload">
              <input
                type="text"
                [(ngModel)]="game.coverImage"
                name="coverImage"
                placeholder="URL okładki lub wgraj z dysku..."
              >
              <input
                type="file"
                #fileInput
                (change)="uploadCover($event)"
                accept="image/*"
                style="display: none"
              >
              <button type="button" (click)="fileInput.click()" class="upload-btn">
                Wybierz plik
              </button>
            </div>

            <div class="cover-preview" *ngIf="game.coverImage">
              <img [src]="getImageUrl(game.coverImage)" alt="Podgląd okładki">
            </div>
          </div>
        </section>

        <!-- Categories (Genres, Series, Studios) -->
        <section class="form-section">
          <h2>Kategorie i powiązania</h2>

          <!-- Genres -->
          <div class="form-group">
            <label>Gatunki (kliknij, aby zaznaczyć)</label>
            <div class="tags-select">
              <div *ngFor="let genre of genres" class="tag-wrapper">
                <span
                  class="tag"
                  [class.selected]="isGenreSelected(genre.id)"
                  (click)="toggleGenre(genre.id)"
                >
                  {{ genre.name }}
                </span>
                <button type="button" (click)="deleteGenre(genre)" class="tag-delete" title="Usuń gatunek z bazy">✕</button>
              </div>
            </div>
            <div class="add-new">
              <input
                type="text"
                [(ngModel)]="newGenre"
                name="newGenre"
                placeholder="Nowy gatunek"
                (keyup.enter)="addGenre()"
              >
              <button type="button" (click)="addGenre()">Dodaj</button>
            </div>
          </div>

          <div class="form-row">
            <!-- Series -->
            <div class="form-group">
              <label for="series">Seria</label>
              <select id="series" [(ngModel)]="selectedSeriesId" name="seriesId">
                <option [ngValue]="null">-- Bez serii --</option>
                <option *ngFor="let s of series" [ngValue]="s.id">{{ s.name }}</option>
              </select>
              <div class="add-new">
                <input
                  type="text"
                  [(ngModel)]="newSeries"
                  name="newSeries"
                  placeholder="Nowa seria"
                  (keyup.enter)="addSeries()"
                >
                <button type="button" (click)="addSeries()">Dodaj</button>
              </div>
              <div class="category-delete-list" *ngIf="series.length > 0">
                <span *ngFor="let s of series" class="deletable-tag">
                  {{ s.name }}
                  <button type="button" (click)="deleteSeries(s)" class="tag-delete" title="Usuń serię z bazy">✕</button>
                </span>
              </div>
            </div>

            <!-- Studio -->
            <div class="form-group">
              <label for="studio">Studio</label>
              <select id="studio" [(ngModel)]="selectedStudioId" name="studioId">
                <option [ngValue]="null">-- Bez studia --</option>
                <option *ngFor="let s of studios" [ngValue]="s.id">{{ s.name }}</option>
              </select>
              <div class="add-new">
                <input
                  type="text"
                  [(ngModel)]="newStudio"
                  name="newStudio"
                  placeholder="Nowe studio"
                  (keyup.enter)="addStudio()"
                >
                <button type="button" (click)="addStudio()">Dodaj</button>
              </div>
              <div class="category-delete-list" *ngIf="studios.length > 0">
                <span *ngFor="let s of studios" class="deletable-tag">
                  {{ s.name }}
                  <button type="button" (click)="deleteStudio(s)" class="tag-delete" title="Usuń studio z bazy">✕</button>
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Platforms -->
        <section class="form-section">
          <h2>Dostępne platformy i linki do sklepów</h2>
          <p class="section-desc">Zaznacz platformy, na których gra jest dostępna i opcjonalnie podaj bezpośrednie linki do zakupu.</p>

          <div class="platforms-grid">
            <div *ngFor="let platform of platformsOptions; let i = index" class="platform-item">
              <label class="platform-checkbox-label">
                <input
                  type="checkbox"
                  [(ngModel)]="platform.selected"
                  [name]="'plat_sel_' + i"
                >
                <span class="platform-name">{{ platform.name }}</span>
              </label>

              <input
                *ngIf="platform.selected"
                type="url"
                [(ngModel)]="platform.url"
                [name]="'plat_url_' + i"
                placeholder="Link do sklepu (np. Steam, PS Store)..."
                class="platform-url-input"
              >
            </div>
          </div>

          <div class="add-new-platform">
            <input
              type="text"
              [(ngModel)]="newPlatformName"
              name="newPlatformName"
              placeholder="Inna platforma (np. GOG, Epic Games Store)..."
              (keyup.enter)="addNewPlatform()"
            >
            <button type="button" (click)="addNewPlatform()">+ Dodaj platformę</button>
          </div>
        </section>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" (click)="cancel()" class="cancel-btn">Anuluj</button>
          <button type="submit" class="save-btn" [disabled]="saving">
            {{ saving ? 'Zapisywanie...' : (isEdit ? 'Zapisz zmiany w grze' : 'Dodaj grę do bazy') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .editor-container { max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; }
    .editor-header { margin-bottom: 2.5rem; }
    .editor-header h1 { font-size: 2.25rem; font-weight: 300; font-family: var(--font-serif); color: var(--text-color); margin: 0; }
    .game-form { display: flex; flex-direction: column; }
    .form-section { background-color: var(--card-bg); border-radius: 12px; padding: 2rem; margin-bottom: 2rem; border: 1px solid var(--border-color); }
    .form-section h2 { font-size: 1.25rem; font-weight: 300; font-family: var(--font-serif); color: var(--text-color); margin: 0 0 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); }
    .section-desc { color: var(--text-muted); font-size: 0.88rem; margin: -0.75rem 0 1.25rem; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group:last-child { margin-bottom: 0; }
    .form-group label { display: block; margin-bottom: 0.5rem; color: var(--text-color); font-weight: 500; font-size: 0.9rem; }
    .form-row { display: flex; gap: 1.5rem; }
    .form-row .form-group { flex: 1; }

    input[type="text"], input[type="date"], input[type="url"], select, textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--input-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-color);
      font-size: 0.95rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }
    input:focus, select:focus { border-color: var(--accent-color); }

    .cover-upload { display: flex; gap: 0.75rem; }
    .cover-upload input { flex: 1; }
    .upload-btn { padding: 0.65rem 1.25rem; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-color); cursor: pointer; white-space: nowrap; font-size: 0.9rem; font-weight: 500; transition: border-color 0.2s ease, color 0.2s ease; }
    .upload-btn:hover { border-color: var(--accent-color); color: var(--accent-color); }
    .cover-preview { margin-top: 1rem; }
    .cover-preview img { max-width: 280px; border-radius: 6px; border: 1px solid var(--border-color); }

    .tags-select { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
    .tag-wrapper { display: inline-flex; align-items: center; gap: 0.25rem; }
    .tag { padding: 0.4rem 0.8rem; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-muted); cursor: pointer; transition: all 0.2s ease; font-size: 0.85rem; font-weight: 500; }
    .tag:hover { border-color: var(--accent-color); color: var(--accent-color); }
    .tag.selected { background: var(--input-bg); border-color: var(--accent-color); color: var(--accent-color); }
    .tag-delete { background: none; border: none; cursor: pointer; font-size: 0.85rem; color: #ff6b7a; padding: 0.2rem; transition: opacity 0.2s; }
    .tag-delete:hover { opacity: 0.8; }
    .category-delete-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
    .deletable-tag { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.5rem; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-muted); font-size: 0.8rem; }

    .add-new { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
    .add-new input { flex: 1; padding: 0.4rem 0.75rem; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-color); font-size: 0.85rem; }
    .add-new button { padding: 0.4rem 1rem; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 6px; color: var(--accent-color); cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: border-color 0.2s ease; }
    .add-new button:hover { border-color: var(--accent-color); }

    .platforms-grid { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem; }
    .platform-item { background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .platform-checkbox-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; user-select: none; }
    .platform-checkbox-label input { width: 18px; height: 18px; accent-color: var(--accent-color); cursor: pointer; }
    .platform-name { font-weight: 600; font-size: 0.9rem; color: var(--text-color); }
    .platform-url-input { font-size: 0.88rem; padding: 0.5rem 0.75rem; }

    .add-new-platform { display: flex; gap: 0.5rem; }
    .add-new-platform input { flex: 1; padding: 0.5rem 0.75rem; font-size: 0.85rem; }
    .add-new-platform button { padding: 0.5rem 1rem; background: transparent; border: 1px dashed var(--border-color); border-radius: 6px; color: var(--accent-color); cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: border-color 0.2s ease; }
    .add-new-platform button:hover { border-color: var(--accent-color); }

    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
    .cancel-btn { padding: 0.65rem 1.5rem; background: transparent; border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-muted); cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: border-color 0.2s ease, color 0.2s ease; }
    .cancel-btn:hover { border-color: var(--text-color); color: var(--text-color); }
    .save-btn { padding: 0.65rem 2rem; background-color: var(--accent-color); border: none; border-radius: 6px; color: white; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: background-color 0.2s ease; }
    .save-btn:hover:not(:disabled) { background-color: var(--accent-hover); }
    .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    @media (max-width: 768px) {
      .form-row { flex-direction: column; gap: 1rem; }
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

  game: Partial<Game> = {
    gameTitle: '',
    coverImage: '',
    releaseDate: null,
    soundtrackUrl: ''
  };

  genres: Category[] = [];
  series: Category[] = [];
  studios: Category[] = [];

  selectedGenreIds: number[] = [];
  selectedSeriesId: number | null = null;
  selectedStudioId: number | null = null;

  newGenre = '';
  newSeries = '';
  newStudio = '';
  newPlatformName = '';

  platformsOptions: PlatformOption[] = [
    { name: 'PC (Steam)', selected: false, url: '' },
    { name: 'PlayStation 5', selected: false, url: '' },
    { name: 'PlayStation 4', selected: false, url: '' },
    { name: 'Xbox Series X/S', selected: false, url: '' },
    { name: 'Xbox One', selected: false, url: '' },
    { name: 'Nintendo Switch', selected: false, url: '' },
    { name: 'Steam Deck', selected: false, url: '' }
  ];

  ngOnInit(): void {
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.gameId = parseInt(id);
      this.loadGame(this.gameId);
    }
  }

  loadCategories(): void {
    this.api.getGenres().subscribe(g => this.genres = g);
    this.api.getSeries().subscribe(s => this.series = s);
    this.api.getStudios().subscribe(st => this.studios = st);
  }

  loadGame(id: number): void {
    this.api.getGameById(id).subscribe({
      next: (res) => {
        const g = res.game;
        this.game = {
          gameTitle: g.gameTitle,
          coverImage: g.coverImage,
          releaseDate: g.releaseDate,
          soundtrackUrl: g.soundtrackUrl || ''
        };

        this.selectedGenreIds = g.genres ? g.genres.map((gen: Category) => gen.id) : [];
        this.selectedSeriesId = g.series ? g.series.id : null;
        this.selectedStudioId = g.studio ? g.studio.id : null;

        if (g.platforms && Array.isArray(g.platforms)) {
          g.platforms.forEach((p: PlatformLink) => {
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
      },
      error: (err: any) => alert('Błąd ładowania gry: ' + (err.error?.error || err.message))
    });
  }

  isGenreSelected(id: number): boolean {
    return this.selectedGenreIds.includes(id);
  }

  toggleGenre(id: number): void {
    const idx = this.selectedGenreIds.indexOf(id);
    if (idx > -1) {
      this.selectedGenreIds.splice(idx, 1);
    } else {
      this.selectedGenreIds.push(id);
    }
  }

  addGenre(): void {
    if (this.newGenre.trim()) {
      this.api.createGenre(this.newGenre.trim()).subscribe({
        next: (g) => {
          this.genres.push(g);
          this.selectedGenreIds.push(g.id);
          this.newGenre = '';
        },
        error: (err) => alert('Błąd: ' + (err.error?.error || err.message))
      });
    }
  }

  deleteGenre(genre: Category): void {
    if (confirm(`Czy na pewno chcesz usunąć gatunek "${genre.name}"?`)) {
      this.api.deleteGenre(genre.id).subscribe({
        next: () => {
          this.genres = this.genres.filter(g => g.id !== genre.id);
          this.selectedGenreIds = this.selectedGenreIds.filter(id => id !== genre.id);
        },
        error: (err) => alert(err.error?.error || 'Błąd usuwania gatunku')
      });
    }
  }

  addSeries(): void {
    if (this.newSeries.trim()) {
      this.api.createSeries(this.newSeries.trim()).subscribe({
        next: (s) => {
          this.series.push(s);
          this.selectedSeriesId = s.id;
          this.newSeries = '';
        },
        error: (err) => alert('Błąd: ' + (err.error?.error || err.message))
      });
    }
  }

  deleteSeries(s: Category): void {
    if (confirm(`Czy na pewno chcesz usunąć serię "${s.name}"?`)) {
      this.api.deleteSeries(s.id).subscribe({
        next: () => {
          this.series = this.series.filter(item => item.id !== s.id);
          if (this.selectedSeriesId === s.id) {
            this.selectedSeriesId = null;
          }
        },
        error: (err) => alert(err.error?.error || 'Błąd usuwania serii')
      });
    }
  }

  addStudio(): void {
    if (this.newStudio.trim()) {
      this.api.createStudio(this.newStudio.trim()).subscribe({
        next: (st) => {
          this.studios.push(st);
          this.selectedStudioId = st.id;
          this.newStudio = '';
        },
        error: (err) => alert('Błąd: ' + (err.error?.error || err.message))
      });
    }
  }

  deleteStudio(st: Category): void {
    if (confirm(`Czy na pewno chcesz usunąć studio "${st.name}"?`)) {
      this.api.deleteStudio(st.id).subscribe({
        next: () => {
          this.studios = this.studios.filter(item => item.id !== st.id);
          if (this.selectedStudioId === st.id) {
            this.selectedStudioId = null;
          }
        },
        error: (err) => alert(err.error?.error || 'Błąd usuwania studia')
      });
    }
  }

  addNewPlatform(): void {
    if (this.newPlatformName.trim()) {
      this.platformsOptions.push({
        name: this.newPlatformName.trim(),
        selected: true,
        url: ''
      });
      this.newPlatformName = '';
    }
  }

  uploadCover(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.api.uploadImage(file).subscribe({
        next: (res) => this.game.coverImage = res.url,
        error: (err) => alert('Błąd przesyłania zdjęcia: ' + (err.error?.error || err.message))
      });
    }
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return url;
    return '/uploads/' + url;
  }

  save(): void {
    if (!this.game.gameTitle?.trim()) {
      alert('Tytuł gry jest wymagany.');
      return;
    }

    this.saving = true;

    const platforms: PlatformLink[] = this.platformsOptions
      .filter(p => p.selected && p.name.trim().length > 0)
      .map(p => ({
        name: p.name.trim(),
        url: p.url?.trim() || undefined
      }));

    const payload = {
      gameTitle: this.game.gameTitle.trim(),
      coverImage: this.game.coverImage || null,
      releaseDate: this.game.releaseDate || null,
      soundtrackUrl: this.game.soundtrackUrl?.trim() || null,
      genreIds: this.selectedGenreIds,
      seriesId: this.selectedSeriesId,
      studioId: this.selectedStudioId,
      platforms
    };

    if (this.isEdit && this.gameId) {
      this.api.updateGame(this.gameId, payload).subscribe({
        next: (savedGame) => {
          this.saving = false;
          this.router.navigate(['/game', savedGame.slug]);
        },
        error: (err) => {
          this.saving = false;
          alert('Błąd aktualizacji gry: ' + (err.error?.error || err.message));
        }
      });
    } else {
      this.api.createGame(payload).subscribe({
        next: (newGame) => {
          this.saving = false;
          // Prompt or redirect directly to write review for this new game
          this.router.navigate(['/admin/review/new', newGame.id]);
        },
        error: (err) => {
          this.saving = false;
          alert('Błąd dodawania gry: ' + (err.error?.error || err.message));
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin']);
  }
}
