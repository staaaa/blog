import { Component, OnInit, AfterViewInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService, Category, CustomRating, Game, GameStatus, PlatformLink, Review } from '../../../core/services/api.service';
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
  imports: [CommonModule, FormsModule, RouterLink, ImageComparisonComponent],
  template: `
    <div class="editor-container">
      <header class="editor-header">
        <h1>{{ isEdit ? 'Edytuj Recenzję' : 'Nowa Recenzja' }}</h1>
      </header>

      <form (ngSubmit)="save()" class="review-form">
        <!-- Game Selection & Basic Info -->
        <section class="form-section">
          <h2>Wybór gry i podstawowe dane</h2>
          
          <div class="form-row">
            <div class="form-group" style="flex: 2;">
              <label for="gameSelect">Wybierz grę *</label>
              <div class="game-select-row">
                <select id="gameSelect" [(ngModel)]="review.gameId" name="gameId" required [disabled]="isEdit">
                  <option [ngValue]="null" disabled>-- Wybierz grę z listy --</option>
                  <option *ngFor="let g of gamesList" [ngValue]="g.id">
                    {{ g.gameTitle }} {{ g.releaseDate ? '(' + (g.releaseDate | date:'yyyy') + ')' : '' }}
                  </option>
                </select>
                <a routerLink="/admin/game/new" class="add-game-btn">
                  + Dodaj nową grę
                </a>
              </div>
            </div>

            <div class="form-group checkbox-container" style="flex: 1;">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="review.isDraft" name="isDraft">
                <span>Zapisz jako wersję roboczą (szkic)</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="title">Tytuł recenzji *</label>
            <input type="text" id="title" [(ngModel)]="review.title" name="title" required placeholder="np. Arcydzieło horroru psychologicznego">
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
        </section>

        <!-- Ratings -->
        <section class="form-section">
          <h2>Oceny (0-10)</h2>
          
          <div class="ratings-grid">
            <div class="rating-input">
              <label>Fabuła</label>
              <input type="number" [(ngModel)]="review.storyRating" name="storyRating" min="0" max="10" step="0.5" (input)="calculateAverage()" required>
            </div>
            <div class="rating-input">
              <label>Muzyka</label>
              <input type="number" [(ngModel)]="review.musicRating" name="musicRating" min="0" max="10" step="0.5" (input)="calculateAverage()" required>
            </div>
            <div class="rating-input">
              <label>Grafika</label>
              <input type="number" [(ngModel)]="review.graphicsRating" name="graphicsRating" min="0" max="10" step="0.5" (input)="calculateAverage()" required>
            </div>
            <div class="rating-input">
              <label>Optymalizacja</label>
              <input type="number" [(ngModel)]="review.optimizationRating" name="optimizationRating" min="0" max="10" step="0.5" (input)="calculateAverage()" required>
            </div>
            <div class="rating-input">
              <label>Gameplay</label>
              <input type="number" [(ngModel)]="review.gameplayRating" name="gameplayRating" min="0" max="10" step="0.5" (input)="calculateAverage()" required>
            </div>
          </div>

          <div class="custom-ratings">
            <h3>Dodatkowe skale ocen</h3>
            <div class="custom-rating-item" *ngFor="let cr of customRatings; let i = index">
              <input type="text" [(ngModel)]="cr.scaleName" [name]="'crName' + i" placeholder="Nazwa skali (np. Klimat)">
              <input type="number" [(ngModel)]="cr.value" [name]="'crValue' + i" min="0" max="10" step="0.5" (input)="calculateAverage()">
              <button type="button" (click)="removeCustomRating(i)" class="remove-btn">Usuń</button>
            </div>
            <button type="button" (click)="addCustomRating()" class="add-rating-btn">+ Dodaj skalę ocen</button>
          </div>

          <div class="average-display">
            <span class="label">Średnia ocena:</span>
            <span class="value">{{ calculatedAverage.toFixed(1) }}</span>
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
          <h2>Treść recenzji *</h2>
          
          <div class="editor-toolbar">
            <button type="button" (click)="insertSpoiler()" class="toolbar-btn spoiler-btn">
              Wstaw spoiler
            </button>
            <button type="button" (click)="openComparisonModal()" class="toolbar-btn compare-btn">
              Wstaw porównywarkę zdjęć
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
            <button type="button" (click)="insertComparisonToQuill()" [disabled]="!comparisonBeforeUrl || !comparisonAfterUrl" class="save-btn">
              Wstaw do recenzji
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editor-container { max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; }
    .editor-header { margin-bottom: 2.5rem; }
    .editor-header h1 { font-size: 2.25rem; font-weight: 300; font-family: var(--font-serif); color: var(--text-color); margin: 0; }
    .review-form { display: flex; flex-direction: column; }
    .form-section { background-color: var(--card-bg); border-radius: 12px; padding: 2rem; margin-bottom: 2rem; border: 1px solid var(--border-color); }
    .form-section h2 { font-size: 1.25rem; font-weight: 300; font-family: var(--font-serif); color: var(--text-color); margin: 0 0 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); }
    .form-section h3 { font-size: 1rem; font-weight: 500; color: var(--text-color); margin: 1.5rem 0 1rem; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group:last-child { margin-bottom: 0; }
    .form-group label { display: block; margin-bottom: 0.5rem; color: var(--text-color); font-weight: 500; font-size: 0.9rem; }
    .form-row { display: flex; gap: 1.5rem; }
    .form-row .form-group { flex: 1; }

    .game-select-row {
      display: flex;
      gap: 0.75rem;
    }

    .add-game-btn {
      display: inline-flex;
      align-items: center;
      padding: 0.75rem 1rem;
      background: var(--input-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--accent-color);
      font-weight: 600;
      font-size: 0.85rem;
      text-decoration: none;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .add-game-btn:hover {
      border-color: var(--accent-color);
    }

    .status-playtime-row {
      align-items: flex-start;
    }

    .status-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .status-option-label {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 0.85rem;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background-color: var(--input-bg);
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 600;
      transition: all 0.2s ease;
      color: var(--text-color);
    }

    .status-option-label input { display: none; }

    .status-option-label.active {
      border-color: var(--accent-color);
      background: rgba(255, 107, 44, 0.12);
      color: var(--accent-color);
    }

    .input-with-suffix {
      position: relative;
    }

    .input-with-suffix input {
      padding-right: 4rem;
    }

    .input-with-suffix .suffix {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 0.85rem;
      pointer-events: none;
    }

    input[type="text"], input[type="date"], input[type="url"], input[type="number"], select, textarea {
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
    input:focus, select:focus, textarea:focus { border-color: var(--accent-color); }
    textarea { resize: vertical; }

    /* Pros & Cons Section Styles */
    .pros-cons-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .pros-editor-card, .cons-editor-card { background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.25rem; }
    .card-title-bar { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); }
    .card-title-bar h3 { margin: 0; font-size: 0.95rem; font-family: var(--font-sans); font-weight: 600; }
    .card-title-bar .icon { font-weight: 700; font-size: 1.1rem; }
    .pros-title { color: #10b981; }
    .cons-title { color: #ef4444; }
    .items-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; }
    .dynamic-item-row { display: flex; align-items: center; gap: 0.5rem; }
    .dynamic-item-row input { flex: 1; padding: 0.5rem 0.75rem; font-size: 0.88rem; }
    .item-delete-btn { background: none; border: 1px solid var(--border-color); border-radius: 4px; color: #ff6b7a; cursor: pointer; padding: 0.45rem 0.6rem; font-size: 0.8rem; transition: background 0.2s ease; }
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
      .form-row { flex-direction: column; gap: 1rem; }
      .pros-cons-grid { grid-template-columns: 1fr; }
      .modal-form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ReviewEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorContainer') editorContainer!: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  private quill!: Quill;
  isEdit = false;
  saving = false;
  reviewId: number | null = null;

  gamesList: Game[] = [];

  readonly statusList: { value: GameStatus; label: string }[] = [
    { value: 'platyna', label: 'Platyna (100%)' },
    { value: 'main_story', label: 'Główny wątek' },
    { value: 'in_progress', label: 'W trakcie' },
    { value: 'abandoned', label: 'Porzucona' }
  ];

  prosList: string[] = [''];
  consList: string[] = [''];

  review: Partial<Review> = {
    gameId: undefined,
    title: '',
    content: '',
    hardwareSpecs: '',
    storyRating: 7,
    musicRating: 7,
    graphicsRating: 7,
    optimizationRating: 7,
    gameplayRating: 7,
    averageRating: 7,
    isDraft: false,
    gameStatus: 'main_story',
    playtimeHours: 0
  };

  customRatings: CustomRating[] = [];
  calculatedAverage = 7;

  // Comparison modal state
  showComparisonModal = false;
  comparisonBeforeUrl = '';
  comparisonAfterUrl = '';
  comparisonLabelBefore = 'Przed';
  comparisonLabelAfter = 'Po';

  ngOnInit(): void {
    this.loadGames();

    const gameIdParam = this.route.snapshot.paramMap.get('gameId');
    if (gameIdParam) {
      this.review.gameId = parseInt(gameIdParam);
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.isEdit = true;
      this.reviewId = parseInt(idParam);
      this.loadReview(this.reviewId);
    }
  }

  ngAfterViewInit(): void {
    this.initQuill();
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  loadGames(): void {
    this.api.getGames(1, 100, 'title', true).subscribe({
      next: (res) => {
        this.gamesList = res.games || [];
      }
    });
  }

  loadReview(id: number): void {
    this.api.getReview(id).subscribe({
      next: (rev) => {
        this.review = {
          gameId: rev.gameId || (rev.game ? rev.game.id : undefined),
          title: rev.title,
          content: rev.content,
          hardwareSpecs: rev.hardwareSpecs || '',
          storyRating: rev.storyRating,
          musicRating: rev.musicRating,
          graphicsRating: rev.graphicsRating,
          optimizationRating: rev.optimizationRating,
          gameplayRating: rev.gameplayRating,
          averageRating: rev.averageRating,
          isDraft: rev.isDraft,
          gameStatus: rev.gameStatus || 'main_story',
          playtimeHours: rev.playtimeHours || 0
        };

        this.prosList = Array.isArray(rev.pros) && rev.pros.length > 0 ? [...rev.pros] : [''];
        this.consList = Array.isArray(rev.cons) && rev.cons.length > 0 ? [...rev.cons] : [''];
        this.customRatings = Array.isArray(rev.customRatings) ? rev.customRatings.map(c => ({ scaleName: c.scaleName, value: c.value })) : [];

        this.calculateAverage();

        if (this.quill && rev.content) {
          this.quill.root.innerHTML = rev.content;
        }
      },
      error: (err) => alert('Błąd pobierania recenzji: ' + (err.error?.error || err.message))
    });
  }

  private initQuill(): void {
    if (typeof window === 'undefined' || !this.editorContainer) return;

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
        }
      }
    });

    if (this.review.content) {
      this.quill.root.innerHTML = this.review.content;
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
        this.api.uploadImage(file).subscribe({
          next: (res) => {
            const range = this.quill.getSelection(true);
            this.quill.insertEmbed(range.index, 'image', res.url);
          },
          error: (err) => alert('Błąd przesyłania zdjęcia: ' + (err.error?.error || err.message))
        });
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
          if (which === 'before') this.comparisonBeforeUrl = res.url;
          else this.comparisonAfterUrl = res.url;
        },
        error: (err) => alert('Błąd przesyłania zdjęcia: ' + (err.error?.error || err.message))
      });
    }
  }

  insertComparisonToQuill(): void {
    if (!this.comparisonBeforeUrl || !this.comparisonAfterUrl) return;
    const tag = `[COMPARE before="${this.comparisonBeforeUrl}" after="${this.comparisonAfterUrl}" labelBefore="${this.comparisonLabelBefore || 'Przed'}" labelAfter="${this.comparisonLabelAfter || 'Po'}"]`;
    const range = this.quill.getSelection(true);
    this.quill.insertText(range.index, '\n' + tag + '\n');
    this.closeComparisonModal();
  }

  addPro(): void { this.prosList.push(''); }
  removePro(i: number): void { this.prosList.splice(i, 1); }
  addCon(): void { this.consList.push(''); }
  removeCon(i: number): void { this.consList.splice(i, 1); }
  trackByIndex(index: number): number { return index; }

  addCustomRating(): void {
    this.customRatings.push({ scaleName: '', value: 7 });
    this.calculateAverage();
  }

  removeCustomRating(i: number): void {
    this.customRatings.splice(i, 1);
    this.calculateAverage();
  }

  calculateAverage(): number {
    const base = [
      this.review.storyRating || 0,
      this.review.musicRating || 0,
      this.review.graphicsRating || 0,
      this.review.optimizationRating || 0,
      this.review.gameplayRating || 0
    ].map(Number);

    const custom = this.customRatings.map(cr => Number(cr.value) || 0);
    const all = [...base, ...custom];
    this.calculatedAverage = all.reduce((sum, v) => sum + v, 0) / all.length;
    this.review.averageRating = parseFloat(this.calculatedAverage.toFixed(1));
    return this.calculatedAverage;
  }

  async save(): Promise<void> {
    if (!this.review.gameId) {
      alert('Wybierz grę, dla której piszesz recenzję.');
      return;
    }

    if (!this.review.title?.trim()) {
      alert('Tytuł recenzji jest wymagany.');
      return;
    }

    const content = this.quill ? this.quill.root.innerHTML : this.review.content;
    if (!content || content === '<p><br></p>') {
      alert('Treść recenzji jest wymagana.');
      return;
    }

    this.saving = true;

    const payload = {
      gameId: this.review.gameId,
      title: this.review.title.trim(),
      content,
      hardwareSpecs: this.review.hardwareSpecs?.trim() || null,
      storyRating: this.review.storyRating,
      musicRating: this.review.musicRating,
      graphicsRating: this.review.graphicsRating,
      optimizationRating: this.review.optimizationRating,
      gameplayRating: this.review.gameplayRating,
      gameStatus: this.review.gameStatus || 'main_story',
      playtimeHours: Number(this.review.playtimeHours) || 0,
      isDraft: !!this.review.isDraft,
      pros: this.prosList.map(p => p.trim()).filter(p => p.length > 0),
      cons: this.consList.map(c => c.trim()).filter(c => c.length > 0),
      customRatings: this.customRatings.filter(cr => cr.scaleName.trim().length > 0)
    };

    if (this.isEdit && this.reviewId) {
      this.api.updateReview(this.reviewId, payload).subscribe({
        next: (rev) => {
          this.saving = false;
          if (rev.game?.slug) {
            this.router.navigate(['/game', rev.game.slug]);
          } else {
            this.router.navigate(['/admin']);
          }
        },
        error: (err) => {
          this.saving = false;
          alert('Błąd aktualizacji recenzji: ' + (err.error?.error || err.message));
        }
      });
    } else {
      this.api.createReview(payload).subscribe({
        next: (rev) => {
          this.saving = false;
          if (rev.game?.slug) {
            this.router.navigate(['/game', rev.game.slug]);
          } else {
            this.router.navigate(['/admin']);
          }
        },
        error: (err) => {
          this.saving = false;
          alert('Błąd publikacji recenzji: ' + (err.error?.error || err.message));
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin']);
  }
}
