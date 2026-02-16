import { Component, OnInit, AfterViewInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, Category, CustomRating, Review } from '../../../core/services/api.service';
import Quill from 'quill';

@Component({
  selector: 'app-review-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-container">
      <header class="editor-header">
        <h1>{{ isEdit ? '✏️ Edytuj Recenzję' : '📝 Nowa Recenzja' }}</h1>
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
              <label for="releaseDate">📅 Data premiery gry</label>
              <input type="date" id="releaseDate" [(ngModel)]="review.releaseDate" name="releaseDate">
            </div>
          </div>

          <div class="form-group">
            <label for="coverImage">Okładka (URL)</label>
            <div class="cover-upload">
              <input type="text" id="coverImage" [(ngModel)]="review.coverImage" name="coverImage" placeholder="URL obrazka lub prześlij">
              <input type="file" #fileInput (change)="uploadCover($event)" accept="image/*" style="display: none">
              <button type="button" (click)="fileInput.click()" class="upload-btn">📁 Prześlij</button>
            </div>
            <div class="cover-preview" *ngIf="review.coverImage">
              <p style="color: #888; font-size: 0.8rem; margin-bottom: 0.5rem;">URL: {{ review.coverImage }}</p>
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
                <span *ngFor="let genre of genres" 
                      class="tag-wrapper">
                  <span (click)="toggleGenre(genre.id)" 
                        class="tag" 
                        [class.selected]="selectedGenreIds.includes(genre.id)">
                    {{ genre.name }}
                  </span>
                  <button type="button" (click)="deleteGenre(genre)" class="tag-delete" title="Usuń gatunek">🗑️</button>
                </span>
              </div>
              <div class="add-new">
                <input type="text" [(ngModel)]="newGenre" name="newGenre" placeholder="Nowy gatunek">
                <button type="button" (click)="addGenre()">+</button>
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
                <button type="button" (click)="addSeries()">+</button>
              </div>
              <div class="category-delete-list" *ngIf="series.length > 0">
                <span *ngFor="let s of series" class="deletable-tag">
                  {{ s.name }}
                  <button type="button" (click)="deleteSeries(s)" class="tag-delete" title="Usuń serię">🗑️</button>
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
                <button type="button" (click)="addStudio()">+</button>
              </div>
              <div class="category-delete-list" *ngIf="studios.length > 0">
                <span *ngFor="let s of studios" class="deletable-tag">
                  {{ s.name }}
                  <button type="button" (click)="deleteStudio(s)" class="tag-delete" title="Usuń studio">🗑️</button>
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
              <label>📖 Fabuła</label>
              <input type="number" [(ngModel)]="review.storyRating" name="storyRating" min="0" max="10" step="0.5" required>
            </div>
            <div class="rating-input">
              <label>🎵 Muzyka</label>
              <input type="number" [(ngModel)]="review.musicRating" name="musicRating" min="0" max="10" step="0.5" required>
            </div>
            <div class="rating-input">
              <label>🎨 Grafika</label>
              <input type="number" [(ngModel)]="review.graphicsRating" name="graphicsRating" min="0" max="10" step="0.5" required>
            </div>
            <div class="rating-input">
              <label>⚡ Optymalizacja</label>
              <input type="number" [(ngModel)]="review.optimizationRating" name="optimizationRating" min="0" max="10" step="0.5" required>
            </div>
            <div class="rating-input">
              <label>🎮 Gameplay</label>
              <input type="number" [(ngModel)]="review.gameplayRating" name="gameplayRating" min="0" max="10" step="0.5" required>
            </div>
          </div>

          <div class="custom-ratings">
            <h3>Dodatkowe skale ocen</h3>
            <div class="custom-rating-item" *ngFor="let cr of customRatings; let i = index">
              <input type="text" [(ngModel)]="cr.scaleName" [name]="'crName' + i" placeholder="Nazwa skali (np. Zagadki)">
              <input type="number" [(ngModel)]="cr.value" [name]="'crValue' + i" min="0" max="10" step="0.5">
              <button type="button" (click)="removeCustomRating(i)" class="remove-btn">✕</button>
            </div>
            <button type="button" (click)="addCustomRating()" class="add-rating-btn">+ Dodaj skalę</button>
          </div>

          <div class="average-display">
            <span class="label">Średnia ocena:</span>
            <span class="value">{{ calculateAverage().toFixed(1) }}</span>
          </div>
        </section>

        <!-- Hardware Specs -->
        <section class="form-section">
          <h2>🖥️ Specyfikacja sprzętowa</h2>
          <textarea 
            [(ngModel)]="review.hardwareSpecs" 
            name="hardwareSpecs" 
            rows="4" 
            placeholder="np. RTX 3080, Ryzen 9 5900X, 32GB RAM..."
          ></textarea>
        </section>

        <!-- Content Editor -->
        <section class="form-section">
          <h2>📝 Treść recenzji</h2>
          
          <div class="editor-toolbar">
            <button type="button" (click)="insertSpoiler()" class="toolbar-btn spoiler-btn">
              🔒 Wstaw spoiler
            </button>
          </div>
          
          <div #editorContainer class="quill-container"></div>
        </section>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" (click)="cancel()" class="cancel-btn">Anuluj</button>
          <button type="submit" class="save-btn" [disabled]="saving">
            {{ saving ? 'Zapisywanie...' : (isEdit ? 'Zapisz zmiany' : 'Opublikuj recenzję') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .editor-container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
    .editor-header h1 { font-size: 2rem; color: white; margin: 0 0 2rem; }

    .form-section { background: linear-gradient(145deg, #1e1e2f 0%, #252538 100%); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid rgba(255, 255, 255, 0.05); }
    .form-section h2 { font-size: 1.2rem; color: #b47cff; margin: 0 0 1.5rem; font-weight: 600; }
    .form-section h3 { font-size: 1rem; color: #a0a0c0; margin: 1.5rem 0 1rem; font-weight: 500; }

    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group label { color: #c0c0d0; font-weight: 500; font-size: 0.9rem; }
    .form-group input, .form-group select, .form-group textarea { padding: 0.8rem 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; color: white; font-size: 1rem; outline: none; transition: border-color 0.2s; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: rgba(138, 43, 226, 0.5); }
    .form-group select { cursor: pointer; }
    .form-group select option { background: #1e1e2f; }
    .form-group textarea { resize: vertical; min-height: 80px; }

    .cover-upload { display: flex; gap: 0.5rem; }
    .cover-upload input { flex: 1; }
    .upload-btn { padding: 0.8rem 1rem; background: rgba(138, 43, 226, 0.2); border: 1px solid rgba(138, 43, 226, 0.3); border-radius: 10px; color: #b47cff; cursor: pointer; white-space: nowrap; }
    .cover-preview { margin-top: 1rem; }
    .cover-preview img { max-width: 300px; border-radius: 10px; }

    .tags-select { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
    .tag-wrapper { display: inline-flex; align-items: center; gap: 0.25rem; }
    .tag { padding: 0.5rem 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; color: #a0a0c0; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; }
    .tag:hover { background: rgba(138, 43, 226, 0.15); }
    .tag.selected { background: rgba(138, 43, 226, 0.25); border-color: rgba(138, 43, 226, 0.5); color: #b47cff; }
    .tag-delete { background: none; border: none; cursor: pointer; font-size: 0.7rem; padding: 0.2rem; opacity: 0.5; transition: opacity 0.2s; }
    .tag-delete:hover { opacity: 1; }
    .category-delete-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
    .deletable-tag { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.3rem 0.6rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; color: #a0a0c0; font-size: 0.8rem; }

    .add-new { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .add-new input { flex: 1; padding: 0.5rem 0.8rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; color: white; font-size: 0.85rem; }
    .add-new button { padding: 0.5rem 0.8rem; background: rgba(0, 200, 150, 0.2); border: 1px solid rgba(0, 200, 150, 0.3); border-radius: 8px; color: #00d9a5; cursor: pointer; font-size: 1rem; }

    .ratings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
    .rating-input { display: flex; flex-direction: column; gap: 0.5rem; }
    .rating-input label { color: #c0c0d0; font-size: 0.9rem; }
    .rating-input input { padding: 0.8rem; text-align: center; font-size: 1.2rem; font-weight: 600; }

    .custom-ratings { margin-top: 1.5rem; }
    .custom-rating-item { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; align-items: center; }
    .custom-rating-item input:first-child { flex: 1; }
    .custom-rating-item input:nth-child(2) { width: 80px; text-align: center; }
    .remove-btn { padding: 0.5rem 0.7rem; background: rgba(220, 53, 69, 0.2); border: 1px solid rgba(220, 53, 69, 0.3); border-radius: 8px; color: #ff6b7a; cursor: pointer; }
    .add-rating-btn { padding: 0.6rem 1rem; background: rgba(138, 43, 226, 0.15); border: 1px dashed rgba(138, 43, 226, 0.3); border-radius: 8px; color: #b47cff; cursor: pointer; width: 100%; margin-top: 0.5rem; }

    .average-display { display: flex; align-items: center; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.05); }
    .average-display .label { color: #a0a0c0; font-weight: 500; }
    .average-display .value { font-size: 2rem; font-weight: 800; background: linear-gradient(135deg, #8a2be2 0%, #00d4aa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    .editor-toolbar { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
    .toolbar-btn { padding: 0.6rem 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #c0c0d0; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
    .toolbar-btn:hover { background: rgba(255, 255, 255, 0.1); }
    .toolbar-btn.spoiler-btn { background: rgba(255, 165, 0, 0.15); border-color: rgba(255, 165, 0, 0.3); color: #ffc04d; }

    .quill-container { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; min-height: 400px; }
    :host ::ng-deep .ql-toolbar { border: none !important; border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; background: rgba(0, 0, 0, 0.2); border-radius: 10px 10px 0 0; }
    :host ::ng-deep .ql-container { border: none !important; font-size: 1rem; }
    :host ::ng-deep .ql-editor { min-height: 350px; color: #d0d0e0; }
    :host ::ng-deep .ql-editor.ql-blank::before { color: #666680; }
    :host ::ng-deep .ql-snow .ql-stroke { stroke: #a0a0c0; }
    :host ::ng-deep .ql-snow .ql-fill { fill: #a0a0c0; }
    :host ::ng-deep .ql-snow .ql-picker { color: #a0a0c0; }
    :host ::ng-deep .ql-snow .ql-picker-options { background: #1e1e2f; border-color: rgba(255, 255, 255, 0.1); }

    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
    .cancel-btn { padding: 0.8rem 1.5rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; color: #a0a0c0; cursor: pointer; font-size: 1rem; }
    .save-btn { padding: 0.8rem 2rem; background: linear-gradient(135deg, #8a2be2 0%, #6a1bb2 100%); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; font-size: 1rem; transition: all 0.2s; }
    .save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(138, 43, 226, 0.4); }
    .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }
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
        toolbar: [
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
        ]
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

  uploadContentImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.api.uploadImage(file).subscribe(res => {
        const range = this.quill.getSelection(true);
        this.quill.insertEmbed(range.index, 'image', res.url);
      });
    }
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

  save(): void {
    this.review.content = this.quill.root.innerHTML;
    
    const validCustomRatings = this.customRatings.filter(cr => cr.scaleName && cr.value !== undefined);

    const payload = {
      ...this.review,
      genreIds: this.selectedGenreIds,
      customRatings: validCustomRatings,
      releaseDate: this.review.releaseDate || null
    };

    this.saving = true;

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
