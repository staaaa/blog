import { Component, OnInit, AfterViewInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService, Category, CustomRating, GameStatus, PlatformLink, Review } from '../../../core/services/api.service';
import { ImageComparisonComponent } from '../../../shared/components/image-comparison/image-comparison.component';
import Quill from 'quill';

interface PlatformOption {
  name: string;
  selected: boolean;
  url: string;
}

@Component({
  selector: 'app-review-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageComparisonComponent],
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

          <!-- Status & Playtime -->
          <div class="form-row status-playtime-row">
            <div class="form-group flex-2">
              <label>Status gry *</label>
              <div class="status-options">
                <label 
                  *ngFor="let s of statusList" 
                  class="status-option-label" 
                  [class.active]="review.gameStatus === s.value"
                  [ngClass]="'status-' + s.value"
                >
                  <input 
                    type="radio" 
                    name="gameStatus" 
                    [value]="s.value" 
                    [(ngModel)]="review.gameStatus" 
                    required
                  />
                  <span class="status-icon">{{ s.icon }}</span>
                  <span class="status-name">{{ s.label }}</span>
                </label>
              </div>
            </div>

            <div class="form-group flex-1">
              <label for="playtimeHours">Czas w grze (godziny) *</label>
              <div class="input-with-suffix">
                <input 
                  type="number" 
                  id="playtimeHours" 
                  [(ngModel)]="review.playtimeHours" 
                  name="playtimeHours" 
                  min="0" 
                  step="0.5" 
                  required 
                  placeholder="np. 35"
                />
                <span class="suffix">godzin</span>
              </div>
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

          <div class="form-group">
            <label for="soundtrackUrl">🎵 Ścieżka dźwiękowa / OST (link do YouTube)</label>
            <input 
              type="url" 
              id="soundtrackUrl" 
              [(ngModel)]="review.soundtrackUrl" 
              name="soundtrackUrl" 
              placeholder="np. https://www.youtube.com/watch?v=... lub https://youtu.be/..."
            />
            <span class="field-hint">Odtwarzacz pojawi się w prawym panelu pod spisem treści, aby czytelnik mógł słuchać muzyki podczas czytania.</span>
          </div>
        </section>

        <!-- Platforms Section -->
        <section class="form-section">
          <h2>Platformy i linki do sklepów</h2>
          <p class="section-desc">Zaznacz platformy, na których gra jest dostępna. Po zaznaczeniu możesz wkleić bezpośredni link do sklepu (np. Steam, PS Store).</p>

          <div class="platforms-grid">
            <div *ngFor="let p of platformsOptions; let i = index" class="platform-item" [class.selected]="p.selected">
              <label class="platform-checkbox-label">
                <input type="checkbox" [(ngModel)]="p.selected" [name]="'plat_sel_' + i">
                <span class="platform-title">{{ p.name }}</span>
              </label>
              <div class="platform-url-input" *ngIf="p.selected">
                <input 
                  type="url" 
                  [(ngModel)]="p.url" 
                  [name]="'plat_url_' + i" 
                  placeholder="https://... (link do sklepu / karty gry)"
                />
              </div>
            </div>
          </div>

          <div class="add-custom-platform">
            <input type="text" [(ngModel)]="newPlatformName" name="newPlatformName" placeholder="Dodaj inną platformę (np. GOG, Epic Games)">
            <button type="button" (click)="addCustomPlatform()">+ Dodaj platformę</button>
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

        <!-- Pros & Cons Section -->
        <section class="form-section">
          <h2>Plusy i Minusy</h2>
          
          <div class="pros-cons-grid">
            <!-- Pros Editor -->
            <div class="pros-editor-card">
              <div class="card-title-bar pros-title">
                <span class="icon">+</span>
                <h3>Zalety (Plusy)</h3>
              </div>
              <div class="items-list">
                <div *ngFor="let item of prosList; let i = index; trackBy: trackByIndex" class="dynamic-item-row">
                  <input 
                    type="text" 
                    [(ngModel)]="prosList[i]" 
                    [name]="'pro_' + i" 
                    placeholder="np. Gęsty klimat i udźwiękowienie"
                  />
                  <button type="button" (click)="removePro(i)" class="item-delete-btn" title="Usuń pozycję">✕</button>
                </div>
              </div>
              <button type="button" (click)="addPro()" class="add-item-btn pros-add-btn">+ Dodaj zaletę</button>
            </div>

            <!-- Cons Editor -->
            <div class="cons-editor-card">
              <div class="card-title-bar cons-title">
                <span class="icon">−</span>
                <h3>Wady (Minusy)</h3>
              </div>
              <div class="items-list">
                <div *ngFor="let item of consList; let i = index; trackBy: trackByIndex" class="dynamic-item-row">
                  <input 
                    type="text" 
                    [(ngModel)]="consList[i]" 
                    [name]="'con_' + i" 
                    placeholder="np. Sporadyczne spadki klatek"
                  />
                  <button type="button" (click)="removeCon(i)" class="item-delete-btn" title="Usuń pozycję">✕</button>
                </div>
              </div>
              <button type="button" (click)="addCon()" class="add-item-btn cons-add-btn">+ Dodaj wadę</button>
            </div>
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
              🔒 Wstaw spoiler
            </button>
            <button type="button" (click)="openComparisonModal()" class="toolbar-btn compare-btn">
              🖼️ Wstaw porównywarkę zdjęć
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

      <!-- Image Comparison Inserter Modal -->
      <div class="modal-backdrop" *ngIf="showComparisonModal" (click)="closeComparisonModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Wstaw Porównywarkę Zdjęć (Przed / Po)</h2>
            <button type="button" class="close-modal-btn" (click)="closeComparisonModal()">✕</button>
          </div>

          <div class="modal-body">
            <div class="modal-form-grid">
              <!-- Before Image -->
              <div class="modal-image-col">
                <h3>Zdjęcie 1 (Lewa strona / Przed)</h3>
                <div class="form-group">
                  <label>Etykieta</label>
                  <input type="text" [(ngModel)]="comparisonLabelBefore" placeholder="np. Przed, RTX OFF, Oryginał">
                </div>
                <div class="form-group">
                  <label>URL zdjęcia lub prześlij</label>
                  <div class="cover-upload">
                    <input type="text" [(ngModel)]="comparisonBeforeUrl" placeholder="URL zdjęcia...">
                    <input type="file" #compareBeforeInput (change)="uploadComparisonFile($event, 'before')" accept="image/*" style="display: none">
                    <button type="button" (click)="compareBeforeInput.click()" class="upload-btn">Prześlij</button>
                  </div>
                </div>
              </div>

              <!-- After Image -->
              <div class="modal-image-col">
                <h3>Zdjęcie 2 (Prawa strona / Po)</h3>
                <div class="form-group">
                  <label>Etykieta</label>
                  <input type="text" [(ngModel)]="comparisonLabelAfter" placeholder="np. Po, RTX ON, Remake">
                </div>
                <div class="form-group">
                  <label>URL zdjęcia lub prześlij</label>
                  <div class="cover-upload">
                    <input type="text" [(ngModel)]="comparisonAfterUrl" placeholder="URL zdjęcia...">
                    <input type="file" #compareAfterInput (change)="uploadComparisonFile($event, 'after')" accept="image/*" style="display: none">
                    <button type="button" (click)="compareAfterInput.click()" class="upload-btn">Prześlij</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Live Preview -->
            <div class="modal-preview-section" *ngIf="comparisonBeforeUrl && comparisonAfterUrl">
              <h3>Podgląd na żywo:</h3>
              <app-image-comparison
                [beforeImage]="comparisonBeforeUrl"
                [afterImage]="comparisonAfterUrl"
                [labelBefore]="comparisonLabelBefore || 'Przed'"
                [labelAfter]="comparisonLabelAfter || 'Po'"
              ></app-image-comparison>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" (click)="closeComparisonModal()" class="cancel-btn">Anuluj</button>
            <button 
              type="button" 
              (click)="insertComparisonToQuill()" 
              class="save-btn"
              [disabled]="!comparisonBeforeUrl || !comparisonAfterUrl"
            >
              Wstaw do recenzji
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editor-container { max-width: 1000px; margin: 0 auto; padding: 2.5rem 1.5rem; }
    .editor-header h1 { font-size: 2rem; font-family: var(--font-serif); font-weight: 300; color: var(--text-color); margin: 0 0 2rem; letter-spacing: -0.5px; }

    .form-section { background-color: var(--card-bg); border-radius: 12px; padding: 1.75rem; margin-bottom: 2rem; border: 1px solid var(--border-color); box-shadow: 0 4px 12px var(--shadow); }
    .form-section h2 { font-size: 1.25rem; font-family: var(--font-serif); font-weight: 300; color: var(--text-color); margin: 0 0 1.5rem; }
    .form-section h3 { font-size: 1.05rem; font-family: var(--font-serif); font-weight: 300; color: var(--text-muted); margin: 1.5rem 0 1rem; }
    .section-desc { font-size: 0.85rem; color: var(--text-muted); margin: -1rem 0 1.25rem; line-height: 1.5; font-family: var(--font-sans); }
    .field-hint { font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; font-family: var(--font-sans); }

    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group label { color: var(--text-color); font-weight: 500; font-size: 0.9rem; }
    .form-group input, .form-group select, .form-group textarea { padding: 0.65rem 0.85rem; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-color); font-size: 0.95rem; outline: none; transition: border-color 0.2s ease; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent-color); }
    .form-group select { cursor: pointer; }
    .form-group select option { background: var(--card-bg); }
    .form-group textarea { resize: vertical; min-height: 80px; }

    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }
    .status-playtime-row { display: flex; flex-wrap: wrap; gap: 1.5rem; }

    /* Game Status Options */
    .status-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.6rem; }
    .status-option-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--input-bg);
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      transition: all 0.2s ease;
      user-select: none;
    }
    .status-option-label input { display: none; }
    .status-option-label:hover { border-color: var(--text-muted); color: var(--text-color); }
    .status-option-label.active.status-platyna { background: rgba(234, 179, 8, 0.15); color: #facc15; border-color: rgba(234, 179, 8, 0.6); }
    .status-option-label.active.status-main_story { background: rgba(16, 185, 129, 0.15); color: #10b981; border-color: rgba(16, 185, 129, 0.6); }
    .status-option-label.active.status-in_progress { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-color: rgba(59, 130, 246, 0.6); }
    .status-option-label.active.status-abandoned { background: rgba(239, 68, 68, 0.15); color: #f87171; border-color: rgba(239, 68, 68, 0.6); }

    /* Input with suffix */
    .input-with-suffix { position: relative; display: flex; align-items: center; }
    .input-with-suffix input { width: 100%; padding-right: 70px; }
    .input-with-suffix .suffix { position: absolute; right: 12px; font-size: 0.85rem; color: var(--text-muted); pointer-events: none; }

    /* Platforms grid */
    .platforms-grid { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem; }
    .platform-item { padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--input-bg); transition: border-color 0.2s ease; }
    .platform-item.selected { border-color: rgba(255, 122, 0, 0.5); }
    .platform-checkbox-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; user-select: none; font-size: 0.92rem; font-weight: 600; color: var(--text-color); }
    .platform-checkbox-label input { width: 18px; height: 18px; accent-color: var(--accent-color); cursor: pointer; }
    .platform-url-input { margin-top: 0.65rem; padding-left: 2rem; }
    .platform-url-input input { width: 100%; padding: 0.5rem 0.75rem; font-size: 0.85rem; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-color); }
    .platform-url-input input:focus { border-color: var(--accent-color); outline: none; }
    .add-custom-platform { display: flex; gap: 0.5rem; max-width: 450px; }
    .add-custom-platform input { flex: 1; padding: 0.45rem 0.75rem; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-color); font-size: 0.85rem; }
    .add-custom-platform button { padding: 0.45rem 1rem; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 6px; color: var(--accent-color); cursor: pointer; font-size: 0.85rem; font-weight: 600; }
    .add-custom-platform button:hover { border-color: var(--accent-color); }

    /* Pros & Cons Editor */
    .pros-cons-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .pros-editor-card, .cons-editor-card { background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 1.25rem; display: flex; flex-direction: column; }
    .pros-editor-card { border-top: 3px solid #10b981; }
    .cons-editor-card { border-top: 3px solid #ef4444; }
    .card-title-bar { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
    .card-title-bar .icon { font-weight: 800; font-size: 1.1rem; }
    .card-title-bar h3 { font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; font-family: var(--font-sans); }
    .pros-title { color: #10b981; }
    .cons-title { color: #ef4444; }
    .dynamic-item-row { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
    .dynamic-item-row input { flex: 1; padding: 0.5rem 0.75rem; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-color); font-size: 0.9rem; }
    .dynamic-item-row input:focus { border-color: var(--accent-color); outline: none; }
    .item-delete-btn { background: transparent; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; color: #f87171; cursor: pointer; padding: 0.5rem 0.65rem; font-size: 0.85rem; }
    .item-delete-btn:hover { background: rgba(239, 68, 68, 0.15); }
    .add-item-btn { margin-top: 0.5rem; padding: 0.5rem; background: transparent; border: 1px dashed var(--border-color); border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; width: 100%; transition: all 0.2s ease; }
    .pros-add-btn { color: #10b981; border-color: rgba(16, 185, 129, 0.3); }
    .pros-add-btn:hover { background: rgba(16, 185, 129, 0.1); border-color: #10b981; }
    .cons-add-btn { color: #ef4444; border-color: rgba(239, 68, 68, 0.3); }
    .cons-add-btn:hover { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }

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

    .editor-toolbar { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.75rem; }
    .toolbar-btn { padding: 0.5rem 1rem; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-color); cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s ease; }
    .toolbar-btn:hover { border-color: var(--accent-color); color: var(--accent-color); }
    .toolbar-btn.spoiler-btn { border-color: rgba(255, 122, 0, 0.3); color: var(--accent-color); }
    .toolbar-btn.compare-btn { border-color: rgba(96, 165, 250, 0.4); color: #60a5fa; }
    .toolbar-btn.compare-btn:hover { border-color: #60a5fa; }

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

    /* Modal styles */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(10, 10, 12, 0.8);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .modal-dialog {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 12px 36px var(--shadow);
      display: flex;
      flex-direction: column;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    .modal-header h2 {
      font-size: 1.2rem;
      font-family: var(--font-serif);
      margin: 0;
      color: var(--text-color);
    }
    .close-modal-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.25rem;
      cursor: pointer;
    }
    .close-modal-btn:hover { color: var(--text-color); }
    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .modal-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .modal-image-col { background: var(--input-bg); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1rem; }
    .modal-image-col h3 { font-size: 0.95rem; font-family: var(--font-sans); font-weight: 600; color: var(--text-color); margin: 0; }
    .modal-preview-section { margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem; }
    .modal-preview-section h3 { font-size: 0.95rem; font-family: var(--font-sans); margin-bottom: 0.75rem; color: var(--text-muted); }
    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.25rem 1.5rem; border-top: 1px solid var(--border-color); background: var(--input-bg); border-radius: 0 0 12px 12px; }

    @media (max-width: 768px) {
      .modal-form-grid { grid-template-columns: 1fr; }
    }
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

  readonly statusList: { value: GameStatus; label: string; icon: string }[] = [
    { value: 'platyna', label: 'Platyna (100%)', icon: '🏆' },
    { value: 'main_story', label: 'Główny wątek', icon: '🎯' },
    { value: 'in_progress', label: 'W trakcie', icon: '⏳' },
    { value: 'abandoned', label: 'Porzucona', icon: '🛑' }
  ];

  platformsOptions: PlatformOption[] = [
    { name: 'PC (Steam)', selected: false, url: '' },
    { name: 'PlayStation 5', selected: false, url: '' },
    { name: 'PlayStation 4', selected: false, url: '' },
    { name: 'Xbox Series X/S', selected: false, url: '' },
    { name: 'Xbox One', selected: false, url: '' },
    { name: 'Nintendo Switch', selected: false, url: '' },
    { name: 'Steam Deck', selected: false, url: '' }
  ];
  newPlatformName = '';

  prosList: string[] = [''];
  consList: string[] = [''];

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
    gameStatus: 'main_story',
    playtimeHours: 0,
    soundtrackUrl: null,
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

  // Image comparison modal state
  showComparisonModal = false;
  comparisonBeforeUrl = '';
  comparisonAfterUrl = '';
  comparisonLabelBefore = 'Przed';
  comparisonLabelAfter = 'Po';

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
      this.customRatings = [...(review.customRatings || [])];

      // Load pros & cons
      this.prosList = review.pros && review.pros.length > 0 ? [...review.pros] : [''];
      this.consList = review.cons && review.cons.length > 0 ? [...review.cons] : [''];

      // Load platforms
      if (review.platforms && Array.isArray(review.platforms)) {
        for (const p of review.platforms) {
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
        }
      }
      
      if (this.quill) {
        this.quill.root.innerHTML = review.content;
      }
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  addPro(): void {
    this.prosList.push('');
  }

  removePro(index: number): void {
    this.prosList.splice(index, 1);
    if (this.prosList.length === 0) {
      this.prosList.push('');
    }
  }

  addCon(): void {
    this.consList.push('');
  }

  removeCon(index: number): void {
    this.consList.splice(index, 1);
    if (this.consList.length === 0) {
      this.consList.push('');
    }
  }

  addCustomPlatform(): void {
    const trimmed = this.newPlatformName.trim();
    if (trimmed) {
      const exists = this.platformsOptions.find(p => p.name.toLowerCase() === trimmed.toLowerCase());
      if (exists) {
        exists.selected = true;
      } else {
        this.platformsOptions.push({
          name: trimmed,
          selected: true,
          url: ''
        });
      }
      this.newPlatformName = '';
    }
  }

  openComparisonModal(): void {
    this.showComparisonModal = true;
  }

  closeComparisonModal(): void {
    this.showComparisonModal = false;
  }

  uploadComparisonFile(event: Event, which: 'before' | 'after'): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.api.uploadImage(file).subscribe({
        next: (res) => {
          if (which === 'before') {
            this.comparisonBeforeUrl = res.url;
          } else {
            this.comparisonAfterUrl = res.url;
          }
        },
        error: (err) => {
          alert('Błąd przesyłania zdjęcia: ' + (err.error?.error || err.message));
        }
      });
    }
  }

  insertComparisonToQuill(): void {
    if (!this.comparisonBeforeUrl || !this.comparisonAfterUrl) return;

    const shortcode = `[COMPARE before="${this.comparisonBeforeUrl}" after="${this.comparisonAfterUrl}" labelBefore="${this.comparisonLabelBefore || 'Przed'}" labelAfter="${this.comparisonLabelAfter || 'Po'}"]`;

    const range = this.quill.getSelection(true);
    const index = range ? range.index : this.quill.getLength();

    this.quill.insertText(index, `\n${shortcode}\n`);
    this.closeComparisonModal();
    this.comparisonBeforeUrl = '';
    this.comparisonAfterUrl = '';
    this.comparisonLabelBefore = 'Przed';
    this.comparisonLabelAfter = 'Po';
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
      this.api.uploadImage(file).subscribe({
        next: (res) => {
          this.review.coverImage = res.url;
        },
        error: (err) => {
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
      this.quill.deleteText(range.index, range.length);
      this.quill.insertText(range.index, `[SPOILER]${selectedText.trim()}[/SPOILER]`);
    } else {
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
    if (!this.review.gameTitle || !this.review.title) {
      alert('Wypełnij tytuł gry i tytuł recenzji!');
      return;
    }

    if (!this.review.gameStatus) {
      alert('Wybierz status gry (np. Główny wątek, Platyna, W trakcie, Porzucona)!');
      return;
    }

    this.saving = true;
    
    let rawContent = this.quill.root.innerHTML;
    try {
      this.review.content = await this.convertBase64Images(rawContent);
    } catch (err) {
      console.error('Error converting base64 images before save:', err);
      this.review.content = rawContent;
    }
    
    const validCustomRatings = this.customRatings.filter(cr => cr.scaleName && cr.value !== undefined);

    const validPros = this.prosList.map(p => p.trim()).filter(p => p.length > 0);
    const validCons = this.consList.map(c => c.trim()).filter(c => c.length > 0);

    const selectedPlatforms: PlatformLink[] = this.platformsOptions
      .filter(p => p.selected && p.name.trim().length > 0)
      .map(p => ({
        name: p.name.trim(),
        url: p.url ? p.url.trim() : undefined
      }));

    const payload = {
      ...this.review,
      genreIds: this.selectedGenreIds,
      customRatings: validCustomRatings,
      pros: validPros,
      cons: validCons,
      gameStatus: this.review.gameStatus || 'main_story',
      playtimeHours: typeof this.review.playtimeHours === 'number' ? this.review.playtimeHours : (parseFloat(String(this.review.playtimeHours)) || 0),
      platforms: selectedPlatforms,
      soundtrackUrl: this.review.soundtrackUrl ? this.review.soundtrackUrl.trim() : null,
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
