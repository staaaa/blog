import { Component, OnInit, AfterViewInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService, Category, CustomRating, Review } from '../../../core/services/api.service';
import Quill from 'quill';

@Component({
  selector: 'app-review-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-container">
      <header class="editor-header">
        <h1>{{ isEdit ? 'Edytuj Recenzję' : 'Nowa Recenzja' }}</h1>
      </header>

      <form (ngSubmit)="save()" class="review-form">
        <!-- Basic Info -->
        <section class="form-section">
          <h2>Informacje podstawowe</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="gameTitle">Tytuł gry *</label>
              <input type="text" id="gameTitle" [(ngModel)]="review.gameTitle" name="gameTitle" required placeholder="np. Silent Hill 2">
            </div>
            <div class="form-group">
              <label for="title">Tytuł recenzji *</label>
              <input type="text" id="title" [(ngModel)]="review.title" name="title" required placeholder="np. Arcydzieło horroru psychologicznego">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="releaseDate">Data premiery gry</label>
              <input type="date" id="releaseDate" [(ngModel)]="review.releaseDate" name="releaseDate">
            </div>
            <div class="form-group checkbox-container">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="review.isDraft" name="isDraft">
                <span>Zapisz jako wersję roboczą (widoczną tylko po zalogowaniu)</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="coverImage">Okładka (URL)</label>
            <div class="cover-upload">
              <input type="text" id="coverImage" [(ngModel)]="review.coverImage" name="coverImage" placeholder="URL obrazka lub prześlij z dysku">
              <input type="file" #fileInput (change)="uploadCover($event)" accept="image/*" style="display: none">
              <button type="button" (click)="fileInput.click()" class="upload-btn">Prześlij plik</button>
            </div>
            <div class="cover-preview" *ngIf="review.coverImage">
              <p class="preview-url">URL: {{ review.coverImage }}</p>
              <img [src]="getImageUrl(review.coverImage)" alt="Podgląd" (error)="onImageError($event)">
            </div>
          </div>
        </section>

        <!-- Categories -->
        <section class="form-section">
          <h2>Kategorie</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label>Gatunki</label>
              <div class="tags-select">
                <span *ngFor="let genre of genres" class="tag-wrapper">
                  <span (click)="toggleGenre(genre.id)" 
                        class="tag" 
                        [class.selected]="selectedGenreIds.includes(genre.id)">
                    {{ genre.name }}
                  </span>
                  <button type="button" (click)="deleteGenre(genre)" class="tag-delete" title="Usuń gatunek">✕</button>
                </span>
              </div>
              <div class="add-new">
                <input type="text" [(ngModel)]="newGenre" name="newGenre" placeholder="Nowy gatunek">
                <button type="button" (click)="addGenre()">Dodaj</button>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="series">Seria</label>
              <select id="series" [(ngModel)]="review.seriesId" name="seriesId">
                <option [ngValue]="null">-- Bez serii --</option>
                <option *ngFor="let s of series" [ngValue]="s.id">{{ s.name }}</option>
              </select>
              <div class="add-new">
                <input type="text" [(ngModel)]="newSeries" name="newSeries" placeholder="Nowa seria">
                <button type="button" (click)="addSeries()">Dodaj</button>
              </div>
              <div class="category-delete-list" *ngIf="series.length > 0">
                <span *ngFor="let s of series" class="deletable-tag">
                  {{ s.name }}
                  <button type="button" (click)="deleteSeries(s)" class="tag-delete" title="Usuń serię">✕</button>
                </span>
              </div>
            </div>

            <div class="form-group">
              <label for="studio">Studio</label>
              <select id="studio" [(ngModel)]="review.studioId" name="studioId">
                <option [ngValue]="null">-- Bez studia --</option>
                <option *ngFor="let s of studios" [ngValue]="s.id">{{ s.name }}</option>
              </select>
              <div class="add-new">
                <input type="text" [(ngModel)]="newStudio" name="newStudio" placeholder="Nowe studio">
                <button type="button" (click)="addStudio()">Dodaj</button>
              </div>
              <div class="category-delete-list" *ngIf="studios.length > 0">
                <span *ngFor="let s of studios" class="deletable-tag">
                  {{ s.name }}
                  <button type="button" (click)="deleteStudio(s)" class="tag-delete" title="Usuń studio">✕</button>
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Ratings -->
        <section class="form-section">
          <h2>Oceny (0-10)</h2>
          
          <div class="ratings-grid">
            <div class="rating-input">
              <label>Fabuła</label>
              <input type="number" [(ngModel)]="review.storyRating" name="storyRating" min="0" max="10" step="0.5" required>
            </div>
            <div class="rating-input">
              <label>Muzyka</label>
              <input type="number" [(ngModel)]="review.musicRating" name="musicRating" min="0" max="10" step="0.5" required>
            </div>
            <div class="rating-input">
              <label>Grafika</label>
              <input type="number" [(ngModel)]="review.graphicsRating" name="graphicsRating" min="0" max="10" step="0.5" required>
            </div>
            <div class="rating-input">
              <label>Optymalizacja</label>
              <input type="number" [(ngModel)]="review.optimizationRating" name="optimizationRating" min="0" max="10" step="0.5" required>
            </div>
            <div class="rating-input">
              <label>Gameplay</label>
              <input type="number" [(ngModel)]="review.gameplayRating" name="gameplayRating" min="0" max="10" step="0.5" required>
            </div>
          </div>

          <div class="custom-ratings">
            <h3>Dodatkowe skale ocen</h3>
            <div class="custom-rating-item" *ngFor="let cr of customRatings; let i = index">
              <input type="text" [(ngModel)]="cr.scaleName" [name]="'crName' + i" placeholder="Nazwa skali (np. Klimat)">
              <input type="number" [(ngModel)]="cr.value" [name]="'crValue' + i" min="0" max="10" step="0.5">
              <button type="button" (click)="removeCustomRating(i)" class="remove-btn">Usuń</button>
            </div>
            <button type="button" (click)="addCustomRating()" class="add-rating-btn">+ Dodaj skalę ocen</button>
          </div>

          <div class="average-display">
            <span class="label">Średnia ocena:</span>
            <span class="value">{{ calculateAverage().toFixed(1) }}</span>
          </div>
        </section>

        <!-- Hardware Specs -->
        <section class="form-section">
          <h2>Specyfikacja sprzętowa</h2>
          <textarea 
            [(ngModel)]="review.hardwareSpecs" 
            name="hardwareSpecs" 
            rows="3" 
            placeholder="np. RTX 4070, Ryzen 7 7800X3D, 32GB RAM..."
          ></textarea>
        </section>

        <!-- Content Editor -->
        <section class="form-section">
          <h2>Treść recenzji</h2>
          
          <div class="editor-toolbar">
            <button type="button" (click)="insertSpoiler()" class="toolbar-btn spoiler-btn">
              Wstaw spoiler
            </button>
          </div>
          
          <div #editorContainer class="quill-container"></div>
        </section>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" (click)="cancel()" class="cancel-btn">Anuluj</button>
          <button type="submit" class="save-btn" [disabled]="saving">
            {{ saving ? 'Zapisywanie...' : (isEdit ? 'Zapisz recenzję' : 'Opublikuj recenzję') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .editor-container { max-width: 1000px; margin: 0 auto; padding: 2.5rem 1.5rem; }
    .editor-header h1 { font-size: 2rem; font-family: var(--font-serif); font-weight: 300; color: var(--text-color); margin: 0 0 2rem; letter-spacing: -0.5px; }

    .form-section { background-color: var(--card-bg); border-radius: 12px; padding: 1.75rem; margin-bottom: 2rem; border: 1px solid var(--border-color); box-shadow: 0 4px 12px var(--shadow); }
    .form-section h2 { font-size: 1.25rem; font-family: var(--font-serif); font-weight: 300; color: var(--text-color); margin: 0 0 1.5rem; }
    .form-section h3 { font-size: 1.05rem; font-family: var(--font-serif); font-weight: 300; color: var(--text-muted); margin: 1.5rem 0 1rem; }

    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group label { color: var(--text-color); font-weight: 500; font-size: 0.9rem; }
    .form-group input, .form-group select, .form-group textarea { padding: 0.65rem 0.85rem; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-color); font-size: 0.95rem; outline: none; transition: border-color 0.2s ease; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent-color); }
    .form-group select { cursor: pointer; }
    .form-group select option { background: var(--card-bg); }
    .form-group textarea { resize: vertical; min-height: 80px; }

    .checkbox-container { justify-content: center; }
    .checkbox-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; user-select: none; }
    .checkbox-label input { width: 18px; height: 18px; accent-color: var(--accent-color); cursor: pointer; }
    .checkbox-label span { color: var(--text-color); font-size: 0.9rem; font-weight: 500; }

    .cover-upload { display: flex; gap: 0.75rem; }
    .cover-upload input { flex: 1; }
    .upload-btn { padding: 0.65rem 1.25rem; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-color); cursor: pointer; white-space: nowrap; font-size: 0.9rem; font-weight: 500; transition: border-color 0.2s ease, color 0.2s ease; }
    .upload-btn:hover { border-color: var(--accent-color); color: var(--accent-color); }
    .cover-preview { margin-top: 1rem; }
    .cover-preview img { max-width: 280px; border-radius: 6px; border: 1px solid var(--border-color); }
    .preview-url { color: var(--text-muted); font-size: 0.75rem; margin-bottom: 0.5rem; }

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

    .ratings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem; }
    .rating-input { display: flex; flex-direction: column; gap: 0.5rem; }
    .rating-input label { color: var(--text-muted); font-size: 0.85rem; font-weight: 500; }
    .rating-input input { padding: 0.65rem; text-align: center; font-size: 1.15rem; font-weight: 700; color: var(--accent-color); }

    .custom-ratings { margin-top: 1.5rem; }
    .custom-rating-item { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; align-items: center; }
    .custom-rating-item input:first-child { flex: 1; }
    .custom-rating-item input:nth-child(2) { width: 80px; text-align: center; color: var(--accent-color); font-weight: 700; }
    .remove-btn { padding: 0.5rem 0.80rem; background: transparent; border: 1px solid rgba(220, 53, 69, 0.4); border-radius: 6px; color: #ff6b7a; cursor: pointer; font-size: 0.85rem; font-weight: 500; }
    .remove-btn:hover { background: rgba(220, 53, 69, 0.1); }
    .add-rating-btn { padding: 0.5rem 1rem; background: transparent; border: 1px dashed var(--border-color); border-radius: 6px; color: var(--accent-color); cursor: pointer; width: 100%; margin-top: 0.5rem; font-size: 0.85rem; font-weight: 500; transition: border-color 0.2s ease; }
    .add-rating-btn:hover { border-color: var(--accent-color); }

    .average-display { display: flex; align-items: center; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); }
    .average-display .label { color: var(--text-muted); font-weight: 500; }
    .average-display .value { font-size: 1.8rem; font-weight: 800; color: var(--accent-color); }

    .editor-toolbar { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
    .toolbar-btn { padding: 0.5rem 1rem; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-color); cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: border-color 0.2s ease, color 0.2s ease; }
    .toolbar-btn:hover { border-color: var(--accent-color); color: var(--accent-color); }
    .toolbar-btn.spoiler-btn { border-color: rgba(255, 122, 0, 0.3); color: var(--accent-color); }

    .quill-container { background: var(--input-bg); border-radius: 10px; min-height: 400px; }
    :host ::ng-deep .ql-container { border: none !important; font-size: 1rem; }
    :host ::ng-deep .ql-editor { min-height: 350px; color: var(--text-color); }
    :host ::ng-deep .ql-editor p { margin-bottom: 0.4rem; line-height: 1.7; }
    :host ::ng-deep .ql-editor.ql-blank::before { color: var(--text-muted); }
    :host ::ng-deep .ql-snow .ql-picker-options { background: var(--card-bg); border-color: var(--border-color); }

    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
    .cancel-btn { padding: 0.65rem 1.5rem; background: transparent; border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-muted); cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: border-color 0.2s ease, color 0.2s ease; }
    .cancel-btn:hover { border-color: var(--text-color); color: var(--text-color); }
    .save-btn { padding: 0.65rem 2rem; background-color: var(--accent-color); border: none; border-radius: 6px; color: white; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: background-color 0.2s ease; }
    .save-btn:hover:not(:disabled) { background-color: var(--accent-hover); }
    .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class ReviewEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorContainer') editorContainer!: ElementRef;
  
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private quill!: Quill;
  isEdit = false;
  saving = false;

  review: Partial<Review> & { seriesId?: number | null; studioId?: number | null } = {
    title: '',
    gameTitle: '',
    content: '',
    hardwareSpecs: '',
    storyRating: 7,
    musicRating: 7,
    graphicsRating: 7,
    optimizationRating: 7,
    gameplayRating: 7,
    coverImage: null,
    releaseDate: null,
    isDraft: false,
    seriesId: null,
    studioId: null
  };

  genres: Category[] = [];
  series: Category[] = [];
  studios: Category[] = [];
  selectedGenreIds: number[] = [];
  customRatings: CustomRating[] = [];

  newGenre = '';
  newSeries = '';
  newStudio = '';

  ngOnInit(): void {
    this.loadCategories();

    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.isEdit = true;
      this.loadReview(+id);
    }
  }

  ngAfterViewInit(): void {
    this.initQuill();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initQuill(): void {
    this.quill = new Quill(this.editorContainer.nativeElement, {
      theme: 'snow',
      placeholder: 'Napisz swoją recenzję...',
      modules: {
        toolbar: {
          container: [
            [{ 'header': [1, 2, 3, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean']
          ],
          handlers: {
            image: () => this.selectLocalImage()
          }
        },
        uploader: {
          mimetypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif'],
          handler: (range: { index: number; length: number }, files: File[]) => {
            this.uploadAndInsertFiles(files, range);
          }
        }
      }
    });

    if (this.review.content) {
      this.quill.root.innerHTML = this.review.content;
    }
  }

  loadCategories(): void {
    this.api.getGenres().subscribe(genres => this.genres = genres);
    this.api.getSeries().subscribe(series => this.series = series);
    this.api.getStudios().subscribe(studios => this.studios = studios);
  }

  loadReview(id: number): void {
    this.api.getReview(id).subscribe(review => {
      this.review = { ...review };
      this.selectedGenreIds = review.genres.map(g => g.id);
      this.customRatings = [...review.customRatings];
      
      if (this.quill) {
        this.quill.root.innerHTML = review.content;
      }
    });
  }

  toggleGenre(id: number): void {
    const index = this.selectedGenreIds.indexOf(id);
    if (index === -1) {
      this.selectedGenreIds.push(id);
    } else {
      this.selectedGenreIds.splice(index, 1);
    }
  }

  addGenre(): void {
    if (this.newGenre.trim()) {
      this.api.createGenre(this.newGenre).subscribe(genre => {
        this.genres.push(genre);
        this.selectedGenreIds.push(genre.id);
        this.newGenre = '';
      });
    }
  }

  addSeries(): void {
    if (this.newSeries.trim()) {
      this.api.createSeries(this.newSeries).subscribe(s => {
        this.series.push(s);
        this.review.seriesId = s.id;
        this.newSeries = '';
      });
    }
  }

  addStudio(): void {
    if (this.newStudio.trim()) {
      this.api.createStudio(this.newStudio).subscribe(s => {
        this.studios.push(s);
        this.review.studioId = s.id;
        this.newStudio = '';
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
        error: (err) => {
          alert(err.error?.error || 'Błąd podczas usuwania gatunku');
        }
      });
    }
  }

  deleteSeries(s: Category): void {
    if (confirm(`Czy na pewno chcesz usunąć serię "${s.name}"?`)) {
      this.api.deleteSeries(s.id).subscribe({
        next: () => {
          this.series = this.series.filter(item => item.id !== s.id);
          if (this.review.seriesId === s.id) {
            this.review.seriesId = null;
          }
        },
        error: (err) => {
          alert(err.error?.error || 'Błąd podczas usuwania serii');
        }
      });
    }
  }

  deleteStudio(s: Category): void {
    if (confirm(`Czy na pewno chcesz usunąć studio "${s.name}"?`)) {
      this.api.deleteStudio(s.id).subscribe({
        next: () => {
          this.studios = this.studios.filter(item => item.id !== s.id);
          if (this.review.studioId === s.id) {
            this.review.studioId = null;
          }
        },
        error: (err) => {
          alert(err.error?.error || 'Błąd podczas usuwania studia');
        }
      });
    }
  }

  addCustomRating(): void {
    this.customRatings.push({ scaleName: '', value: 7 });
  }

  removeCustomRating(index: number): void {
    this.customRatings.splice(index, 1);
  }

  calculateAverage(): number {
    const baseRatings = [
      this.review.storyRating || 0,
      this.review.musicRating || 0,
      this.review.graphicsRating || 0,
      this.review.optimizationRating || 0,
      this.review.gameplayRating || 0
    ];
    
    const customValues = this.customRatings
      .filter(cr => cr.scaleName && cr.value !== undefined)
      .map(cr => cr.value);
    
    const all = [...baseRatings, ...customValues];
    return all.reduce((sum, val) => sum + val, 0) / all.length;
  }

  getImageUrl(url: string | null): string {
    if (!url) return '';
    // For Docker: images are served from /uploads/ via nginx proxy
    if (url.startsWith('/uploads/')) {
      return url;
    }
    if (url.startsWith('http')) {
      return url;
    }
    return '/uploads/' + url;
  }

  uploadCover(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      console.log('Uploading cover:', file.name);
      this.api.uploadImage(file).subscribe({
        next: (res) => {
          console.log('Cover upload response:', res);
          this.review.coverImage = res.url;
          console.log('Cover image set to:', this.review.coverImage);
        },
        error: (err) => {
          console.error('Cover upload error:', err);
          alert('Błąd uploadu: ' + (err.error?.error || err.message));
        }
      });
    }
  }

  onImageError(event: Event): void {
    console.error('Image failed to load:', (event.target as HTMLImageElement).src);
  }

  async uploadAndInsertFiles(files: File[], range?: { index: number; length: number }): Promise<void> {
    let insertIndex = range?.index ?? this.quill.getSelection(true)?.index ?? this.quill.getLength();

    if (range && range.length > 0) {
      this.quill.deleteText(range.index, range.length);
    }

    for (const file of files) {
      try {
        const res = await firstValueFrom(this.api.uploadImage(file));
        this.quill.insertEmbed(insertIndex, 'image', res.url);
        insertIndex++;
        this.quill.setSelection(insertIndex, 0);
      } catch (err: any) {
        console.error('Image upload failed:', err);
        alert('Błąd przesyłania zdjęcia: ' + (err.error?.error || err.message));
      }
    }
  }

  uploadAndInsertImage(file: File, range?: { index: number; length: number }): void {
    this.uploadAndInsertFiles([file], range);
  }

  selectLocalImage(): void {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        this.uploadAndInsertFiles([file]);
      }
    };
  }

  insertSpoiler(): void {
    const range = this.quill.getSelection(true);
    const selectedText = this.quill.getText(range.index, range.length);
    
    if (selectedText && selectedText.trim()) {
      // Wrap selected text with spoiler markers
      this.quill.deleteText(range.index, range.length);
      this.quill.insertText(range.index, `[SPOILER]${selectedText.trim()}[/SPOILER]`);
    } else {
      // Insert placeholder
      this.quill.insertText(range.index, '[SPOILER]tutaj wpisz tekst spoilera[/SPOILER]');
    }
  }

  private async convertBase64Images(content: string): Promise<string> {
    if (!content.includes('data:image/')) {
      return content;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const base64Images = Array.from(doc.querySelectorAll('img[src^="data:image/"]'));

    if (base64Images.length === 0) {
      return content;
    }

    for (let i = 0; i < base64Images.length; i++) {
      const img = base64Images[i];
      const src = img.getAttribute('src');
      if (!src || !src.startsWith('data:image/')) continue;

      try {
        const file = this.base64ToFile(src, `pasted-image-${Date.now()}-${i}.png`);
        const res = await firstValueFrom(this.api.uploadImage(file));
        img.setAttribute('src', res.url);
      } catch (err) {
        console.error('Failed to convert base64 image:', err);
      }
    }

    return doc.body.innerHTML;
  }

  private base64ToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  async save(): Promise<void> {
    this.saving = true;
    
    let rawContent = this.quill.root.innerHTML;
    try {
      this.review.content = await this.convertBase64Images(rawContent);
    } catch (err) {
      console.error('Error converting base64 images before save:', err);
      this.review.content = rawContent;
    }
    
    const validCustomRatings = this.customRatings.filter(cr => cr.scaleName && cr.value !== undefined);

    const payload = {
      ...this.review,
      genreIds: this.selectedGenreIds,
      customRatings: validCustomRatings,
      releaseDate: this.review.releaseDate || null
    };

    const request = this.isEdit 
      ? this.api.updateReview(this.review.id!, payload)
      : this.api.createReview(payload);

    request.subscribe({
      next: () => {
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        alert('Błąd: ' + (err.error?.error || 'Nie udało się zapisać'));
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin']);
  }
}
