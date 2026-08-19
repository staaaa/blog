import { Component, OnInit, AfterViewInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService, CustomRating, Game, GameStatus, Review } from '../../../core/services/api.service';
import { ImageComparisonComponent } from '../../../shared/components/image-comparison/image-comparison.component';
import Quill from 'quill';

@Component({
  selector: 'app-review-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ImageComparisonComponent],
  template: `
    <div class="editor-container">
      <header class="editor-header">
        <h1>{{ isEdit ? 'Edytuj Recenzję' : 'Napisz Nową Recenzję' }}</h1>
        <p class="editor-subtitle">
          Wypełnij treść recenzji, swoje oceny, plusy i minusy dla wybranej gry.
        </p>
      </header>

      <form (ngSubmit)="save()" class="review-form">
        <!-- Game Selection & Basic Info -->
        <section class="form-section">
          <h2>Wybór gry i podstawowe dane</h2>
          
          <div class="form-row">
            <div class="form-group flex-2">
              <label for="gameSelect">Wybierz grę, którą recenzujesz *</label>
              <div class="game-select-row">
                <select id="gameSelect" [(ngModel)]="review.gameId" name="gameId" required [disabled]="isEdit">
                  <option [ngValue]="null" disabled>-- Wybierz grę z listy --</option>
                  <option *ngFor="let g of gamesList" [ngValue]="g.id">
                    {{ g.gameTitle }} {{ g.releaseDate ? '(' + (g.releaseDate | date:'yyyy') + ')' : '' }}
                  </option>
                </select>
                <a routerLink="/admin/game/new" class="add-game-btn" title="Dodaj grę do listy jeśli jej nie ma">
                  + Nowa gra
                </a>
              </div>
            </div>

            <div class="form-group flex-1">
              <label class="checkbox-label draft-toggle">
                <input type="checkbox" [(ngModel)]="review.isDraft" name="isDraft">
                <span>Zapisz jako szkic</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="title">Tytuł Twojej recenzji *</label>
            <input
              type="text"
              id="title"
              [(ngModel)]="review.title"
              name="title"
              required
              placeholder="np. Arcydzieło horroru psychologicznego, Godny powrót klasyka..."
            >
          </div>

          <!-- Status & Playtime -->
          <div class="form-row status-playtime-row">
            <div class="form-group flex-2">
              <label>Twój status ukończenia gry *</label>
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
              <label for="playtimeHours">Czas spędzony w grze (godziny) *</label>
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

        <!-- Ratings Section -->
        <section class="form-section">
          <h2>Twoje oceny (Skala 0 - 10)</h2>
          <div class="ratings-grid">
            <div class="form-group rating-group">
              <label for="storyRating">Fabuła</label>
              <div class="rating-input-wrapper">
                <input type="range" id="storyRating" [(ngModel)]="review.storyRating" name="storyRating" min="0" max="10" step="0.5" (input)="calculateAverage()">
                <span class="rating-value">{{ review.storyRating }}</span>
              </div>
            </div>

            <div class="form-group rating-group">
              <label for="musicRating">Muzyka i Udźwiękowienie</label>
              <div class="rating-input-wrapper">
                <input type="range" id="musicRating" [(ngModel)]="review.musicRating" name="musicRating" min="0" max="10" step="0.5" (input)="calculateAverage()">
                <span class="rating-value">{{ review.musicRating }}</span>
              </div>
            </div>

            <div class="form-group rating-group">
              <label for="graphicsRating">Grafika i Wizualia</label>
              <div class="rating-input-wrapper">
                <input type="range" id="graphicsRating" [(ngModel)]="review.graphicsRating" name="graphicsRating" min="0" max="10" step="0.5" (input)="calculateAverage()">
                <span class="rating-value">{{ review.graphicsRating }}</span>
              </div>
            </div>

            <div class="form-group rating-group">
              <label for="optimizationRating">Optymalizacja i Stan techniczny</label>
              <div class="rating-input-wrapper">
                <input type="range" id="optimizationRating" [(ngModel)]="review.optimizationRating" name="optimizationRating" min="0" max="10" step="0.5" (input)="calculateAverage()">
                <span class="rating-value">{{ review.optimizationRating }}</span>
              </div>
            </div>

            <div class="form-group rating-group">
              <label for="gameplayRating">Gameplay i Grywalność</label>
              <div class="rating-input-wrapper">
                <input type="range" id="gameplayRating" [(ngModel)]="review.gameplayRating" name="gameplayRating" min="0" max="10" step="0.5" (input)="calculateAverage()">
                <span class="rating-value">{{ review.gameplayRating }}</span>
              </div>
            </div>
          </div>

          <!-- Custom Ratings -->
          <div class="custom-ratings-section">
            <h3>Własne skale ocen</h3>
            <div *ngFor="let cr of customRatings; let i = index" class="custom-rating-row">
              <input type="text" [(ngModel)]="cr.scaleName" [name]="'custom_name_' + i" placeholder="Nazwa kryterium (np. Klimat, Bossowie)">
              <div class="rating-input-wrapper">
                <input type="range" [(ngModel)]="cr.value" [name]="'custom_val_' + i" min="0" max="10" step="0.5" (input)="calculateAverage()">
                <span class="rating-value">{{ cr.value }}</span>
              </div>
              <button type="button" (click)="removeCustomRating(i)" class="remove-btn">✕</button>
            </div>
            <button type="button" (click)="addCustomRating()" class="add-rating-btn">+ Dodaj dodatkowe kryterium</button>
          </div>

          <div class="average-preview">
            <span class="average-label">Twoja ocena końcowa:</span>
            <span class="average-score">{{ calculatedAverage.toFixed(1) }} / 10</span>
          </div>
        </section>

        <!-- Pros & Cons Section -->
        <section class="form-section">
          <h2>Plusy i Minusy</h2>
          <div class="pros-cons-grid">
            <!-- Pros Column -->
            <div class="pro-con-col pros-col">
              <div class="col-header">
                <span class="col-icon">👍</span>
                <h3>Plusy</h3>
              </div>
              <div class="items-list">
                <div *ngFor="let pro of prosList; let i = index; trackBy: trackByIndex" class="item-row">
                  <span class="bullet pro-bullet">+</span>
                  <input type="text" [(ngModel)]="prosList[i]" [name]="'pro_' + i" placeholder="np. Rewelacyjny klimat...">
                  <button type="button" (click)="removePro(i)" class="remove-item-btn" title="Usuń">✕</button>
                </div>
              </div>
              <button type="button" (click)="addPro()" class="add-item-btn add-pro-btn">+ Dodaj plus</button>
            </div>

            <!-- Cons Column -->
            <div class="pro-con-col cons-col">
              <div class="col-header">
                <span class="col-icon">👎</span>
                <h3>Minusy</h3>
              </div>
              <div class="items-list">
                <div *ngFor="let con of consList; let i = index; trackBy: trackByIndex" class="item-row">
                  <span class="bullet con-bullet">-</span>
                  <input type="text" [(ngModel)]="consList[i]" [name]="'con_' + i" placeholder="np. Drobne spadki klatek...">
                  <button type="button" (click)="removeCon(i)" class="remove-item-btn" title="Usuń">✕</button>
                </div>
              </div>
              <button type="button" (click)="addCon()" class="add-item-btn add-con-btn">+ Dodaj minus</button>
            </div>
          </div>
        </section>

        <!-- Hardware Specs -->
        <section class="form-section">
          <h2>Twoja specyfikacja sprzętowa (opcjonalnie)</h2>
          <div class="form-group">
            <input
              type="text"
              id="hardwareSpecs"
              [(ngModel)]="review.hardwareSpecs"
              name="hardwareSpecs"
              placeholder="np. RTX 4080, Ryzen 7 7800X3D, 32GB RAM, 1440p Ultra / PS5 Performance Mode"
            >
          </div>
        </section>

        <!-- Content Section (Quill) -->
        <section class="form-section">
          <h2>Treść recenzji *</h2>
          
          <div class="toolbar-extra">
            <button type="button" (click)="insertSpoiler()" class="toolbar-btn spoiler-btn" title="Wstaw ukryty spoiler">
              ⚠️ Wstaw spoiler
            </button>
            <button type="button" (click)="openComparisonModal()" class="toolbar-btn comparison-btn" title="Wstaw suwak porównania zdjęć (Przed/Po)">
              🖼️ Porównywarka zdjęć
            </button>
          </div>

          <div #quillEditor class="quill-wrapper"></div>
          <input type="file" #quillFileInput (change)="selectLocalImage()" accept="image/*" style="display: none">
        </section>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" (click)="cancel()" class="cancel-btn">Anuluj</button>
          <button type="submit" [disabled]="saving" class="save-btn">
            {{ saving ? 'Zapisywanie...' : (isEdit ? 'Zapisz zmiany w recenzji' : 'Opublikuj recenzję') }}
          </button>
        </div>
      </form>

      <!-- Image Comparison Modal -->
      <div class="modal-backdrop" *ngIf="showComparisonModal" (click)="closeComparisonModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Wstaw porównywarkę zdjęć (Przed / Po)</h2>
            <button type="button" class="modal-close" (click)="closeComparisonModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-form-grid">
              <!-- Left: Before Image -->
              <div class="modal-col">
                <h4>Zdjęcie 1 (Przed / Lewa strona)</h4>
                <div class="form-group">
                  <label>Etykieta</label>
                  <input type="text" [(ngModel)]="comparisonLabelBefore" placeholder="np. Przed, Oryginał, RTX OFF">
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

              <!-- Right: After Image -->
              <div class="modal-col">
                <h4>Zdjęcie 2 (Po / Prawa strona)</h4>
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
    .editor-container {
      max-width: 980px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }

    .editor-header h1 {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .editor-subtitle {
      color: var(--text-muted);
      margin-bottom: 2rem;
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
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 1.25rem 0;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.45rem;
      color: var(--text-primary);
      font-size: 0.9rem;
    }

    .form-row {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
    }

    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }

    .game-select-row {
      display: flex;
      gap: 0.75rem;
    }

    .add-game-btn {
      display: inline-flex;
      align-items: center;
      padding: 0.75rem 1rem;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--accent-color);
      font-weight: 700;
      font-size: 0.85rem;
      text-decoration: none;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .add-game-btn:hover {
      border-color: var(--accent-color);
      background: rgba(255, 107, 44, 0.08);
    }

    .draft-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 2rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    input[type="text"],
    input[type="number"],
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

    .status-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .status-option-label {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.85rem;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background-color: var(--bg-color);
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 600;
      transition: all 0.2s ease;
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

    /* Ratings */
    .ratings-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .rating-input-wrapper {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .rating-input-wrapper input[type="range"] {
      flex: 1;
      accent-color: var(--accent-color);
    }

    .rating-value {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--text-primary);
      width: 35px;
      text-align: right;
    }

    .custom-ratings-section {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .custom-ratings-section h3 {
      font-size: 1rem;
      margin: 0 0 1rem;
      color: var(--text-primary);
    }

    .custom-rating-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    .custom-rating-row input[type="text"] {
      flex: 1;
    }

    .remove-btn {
      background: transparent;
      border: none;
      color: #ef4444;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0.4rem;
    }

    .add-rating-btn {
      padding: 0.5rem 1rem;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .average-preview {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 1.75rem;
      padding: 1rem 1.5rem;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 10px;
    }

    .average-label {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .average-score {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--accent-color);
    }

    /* Pros & Cons */
    .pros-cons-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .pro-con-col {
      background: var(--bg-color);
      border-radius: 10px;
      padding: 1.25rem;
      border: 1px solid var(--border-color);
    }

    .col-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .col-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      margin-bottom: 1rem;
    }

    .item-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .bullet {
      font-weight: 800;
      font-size: 1.1rem;
      width: 15px;
    }

    .pro-bullet { color: #10b981; }
    .con-bullet { color: #ef4444; }

    .item-row input {
      flex: 1;
      padding: 0.5rem 0.75rem;
      font-size: 0.88rem;
    }

    .remove-item-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.9rem;
      padding: 0.3rem;
    }

    .remove-item-btn:hover { color: #ef4444; }

    .add-item-btn {
      width: 100%;
      padding: 0.5rem;
      border: 1px dashed var(--border-color);
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.82rem;
      transition: all 0.2s ease;
    }

    .add-pro-btn { color: #10b981; border-color: rgba(16, 185, 129, 0.4); }
    .add-pro-btn:hover { background: rgba(16, 185, 129, 0.08); }

    .add-con-btn { color: #ef4444; border-color: rgba(239, 68, 68, 0.4); }
    .add-con-btn:hover { background: rgba(239, 68, 68, 0.08); }

    /* Quill & Toolbar */
    .toolbar-extra {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .toolbar-btn {
      padding: 0.45rem 0.9rem;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .toolbar-btn:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
    }

    .quill-wrapper {
      min-height: 400px;
      background-color: var(--input-bg);
      border-radius: 0 0 8px 8px;
    }

    :host ::ng-deep .ql-toolbar {
      background-color: var(--bg-color);
      border-color: var(--border-color) !important;
      border-radius: 8px 8px 0 0;
    }

    :host ::ng-deep .ql-container {
      border-color: var(--border-color) !important;
      border-radius: 0 0 8px 8px;
      font-size: 1.05rem;
      min-height: 350px;
      color: var(--text-primary);
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1.5rem;
    }

    .modal-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 16px 40px var(--shadow);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .modal-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 1.25rem;
      cursor: pointer;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .modal-col h4 {
      margin: 0 0 0.75rem;
      font-size: 0.95rem;
      color: var(--text-primary);
    }

    .modal-preview-section {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .modal-preview-section h3 {
      font-size: 0.9rem;
      margin: 0 0 0.75rem;
      color: var(--text-muted);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .cover-upload {
      display: flex;
      gap: 0.5rem;
    }

    .upload-btn {
      padding: 0.5rem 0.85rem;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.82rem;
      cursor: pointer;
      white-space: nowrap;
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

    .cancel-btn:hover { color: var(--text-primary); border-color: var(--text-muted); }

    .save-btn {
      background: var(--accent-color);
      border: none;
      color: #ffffff;
    }

    .save-btn:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .form-row, .ratings-grid, .pros-cons-grid, .modal-form-grid {
        grid-template-columns: 1fr;
        flex-direction: column;
      }
    }
  `]
})
export class ReviewEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('quillEditor') quillElement!: ElementRef;
  @ViewChild('quillFileInput') quillFileInput!: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  isEdit = false;
  saving = false;
  reviewId: number | null = null;
  quillInstance: any = null;

  gamesList: Game[] = [];

  readonly statusList: { value: GameStatus; label: string; icon: string }[] = [
    { value: 'platyna', label: 'Platyna (100%)', icon: '🏆' },
    { value: 'main_story', label: 'Główny wątek', icon: '🎯' },
    { value: 'in_progress', label: 'W trakcie', icon: '⏳' },
    { value: 'abandoned', label: 'Porzucona', icon: '🛑' }
  ];

  prosList: string[] = [];
  consList: string[] = [];

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
    this.quillInstance = null;
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

        this.prosList = Array.isArray(rev.pros) ? [...rev.pros] : [];
        this.consList = Array.isArray(rev.cons) ? [...rev.cons] : [];
        this.customRatings = Array.isArray(rev.customRatings) ? rev.customRatings.map(c => ({ scaleName: c.scaleName, value: c.value })) : [];

        this.calculateAverage();

        if (this.quillInstance && rev.content) {
          this.quillInstance.root.innerHTML = rev.content;
        }
      },
      error: (err) => alert('Błąd pobierania recenzji: ' + (err.error?.error || err.message))
    });
  }

  initQuill(): void {
    if (typeof window === 'undefined' || !this.quillElement) return;

    const toolbarOptions = [
      [{ header: [1, 2, 3, false] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ];

    this.quillInstance = new Quill(this.quillElement.nativeElement, {
      theme: 'snow',
      modules: {
        toolbar: {
          container: toolbarOptions,
          handlers: {
            image: () => {
              this.quillFileInput.nativeElement.click();
            }
          }
        }
      },
      placeholder: 'Napisz pełną treść recenzji...'
    });

    if (this.review.content) {
      this.quillInstance.root.innerHTML = this.review.content;
    }
  }

  selectLocalImage(): void {
    const file = this.quillFileInput.nativeElement.files?.[0];
    if (file) {
      this.api.uploadImage(file).subscribe({
        next: (res) => {
          const range = this.quillInstance.getSelection(true);
          this.quillInstance.insertEmbed(range.index, 'image', res.url);
          this.quillFileInput.nativeElement.value = '';
        },
        error: (err) => alert('Błąd przesyłania zdjęcia: ' + (err.error?.error || err.message))
      });
    }
  }

  insertSpoiler(): void {
    const range = this.quillInstance?.getSelection();
    if (range) {
      const selectedText = this.quillInstance.getText(range.index, range.length);
      const text = selectedText || 'Treść ukrytego spoilera...';
      this.quillInstance.deleteText(range.index, range.length);
      this.quillInstance.insertText(range.index, `[SPOILER]${text}[/SPOILER]`);
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
    const range = this.quillInstance.getSelection(true);
    this.quillInstance.insertText(range.index, '\n' + tag + '\n');
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

  calculateAverage(): void {
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

    const content = this.quillInstance ? this.quillInstance.root.innerHTML : this.review.content;
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
      pros: this.prosList.filter(p => p.trim().length > 0),
      cons: this.consList.filter(c => c.trim().length > 0),
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
