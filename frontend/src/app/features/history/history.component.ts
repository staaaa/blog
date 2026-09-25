import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  PLATFORM_ID,
  HostListener,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Title, Meta } from '@angular/platform-browser';
import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
import { HistoricalEvent, findHistoricalEvent } from './history-events.data';

export type MapMode = 'political' | 'religious' | 'diplomatic' | 'terrain';

export interface EraItem {
  year: number;
  filename: string;
  title: string;
  epoch: string;
  desc: string;
}

export interface CountryProperties {
  id: number;
  name: string;
  overlord: string | null;
  isSubject: boolean;
  status: string;
  countryColor: string;
  overlordColor: string;
  fillColor: string;
  ruler: string;
  religion: string;
  religionColor: string;
  population: number;
  populationFormatted: string;
  capital: string;
  allies: string[];
  enemies: string[];
  originalAbbr?: string | null;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="history-page" [class.is-fullscreen]="isFullscreen">
      <!-- TOP HUD BAR -->
      <header class="history-hud">
        <div class="hud-left">
          <div class="hud-badge">
            <span class="live-dot"></span>
            Atlas Historyczny
          </div>
          <div class="era-title-group">
            <h1 class="hud-year">{{ getFormattedYear(selectedYear) }}</h1>
            <span class="hud-epoch">{{ currentEra?.epoch }}</span>
          </div>
        </div>

        <!-- MODE SWITCHER (Q, W, E, R) -->
        <div class="hud-modes">
          <button
            type="button"
            class="mode-btn"
            [class.active]="activeMode === 'political'"
            (click)="setMode('political')"
            title="Tryb polityczny (Skrót: Q)"
          >
            <span class="key-badge">Q</span>
            <span class="mode-icon">🏛️</span>
            <span class="mode-label">Polityczna</span>
          </button>

          <button
            type="button"
            class="mode-btn"
            [class.active]="activeMode === 'religious'"
            (click)="setMode('religious')"
            title="Tryb religijny (Skrót: W)"
          >
            <span class="key-badge">W</span>
            <span class="mode-icon">✨</span>
            <span class="mode-label">Religijna</span>
          </button>

          <button
            type="button"
            class="mode-btn"
            [class.active]="activeMode === 'diplomatic'"
            (click)="setMode('diplomatic')"
            title="Tryb dyplomatyczny (Skrót: E)"
          >
            <span class="key-badge">E</span>
            <span class="mode-icon">⚔️</span>
            <span class="mode-label">Dyplomatyczna</span>
          </button>

          <button
            type="button"
            class="mode-btn"
            [class.active]="activeMode === 'terrain'"
            (click)="setMode('terrain')"
            title="Tryb ukształtowania terenu (Skrót: R)"
          >
            <span class="key-badge">R</span>
            <span class="mode-icon">🏔️</span>
            <span class="mode-label">Topografia</span>
          </button>
        </div>

        <!-- SEARCH & CONTROLS -->
        <div class="hud-right">
          <button
            type="button"
            class="great-powers-btn"
            [class.active]="showGreatPowers"
            (click)="toggleGreatPowers()"
            title="Ranking Wielkich Mocarstw (EU4 Ledger)"
          >
            <span class="gp-crown">👑</span>
            <span class="gp-label">Mocarstwa</span>
            <span class="gp-count">8</span>
          </button>

          <div class="search-box">
            <input
              type="text"
              [(ngModel)]="searchFilter"
              (input)="onSearchInput()"
              placeholder="Szukaj państwa..."
              class="hud-input"
            />
            <div class="search-dropdown" *ngIf="searchResults.length > 0">
              <button
                type="button"
                *ngFor="let res of searchResults"
                (click)="selectSearchResult(res)"
                class="search-item"
              >
                <span class="item-color" [style.background-color]="res.fillColor"></span>
                <span class="item-name">{{ res.name }}</span>
                <span class="item-status" *ngIf="res.isSubject">(podległe)</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            class="icon-action-btn"
            (click)="resetView()"
            title="Wyśrodkuj mapę"
          >
            ⌖
          </button>

          <button
            type="button"
            class="icon-action-btn"
            (click)="toggleFullscreen()"
            title="Pełny ekran"
          >
            {{ isFullscreen ? '🗗' : '⛶' }}
          </button>
        </div>
      </header>

      <!-- MAP CONTAINER -->
      <div class="map-viewport">
        <div #mapContainer class="map-canvas"></div>

        <!-- LOADING OVERLAY -->
        <div class="loading-overlay" *ngIf="isLoading">
          <div class="spinner"></div>
          <span>Wczytywanie granic ({{ currentEra?.year }} r.)...</span>
        </div>

        <!-- FLOATING TOOLTIP (DYMEK) -->
        <div
          class="map-tooltip"
          *ngIf="hoveredCountry"
          [style.left.px]="tooltipX"
          [style.top.px]="tooltipY"
        >
          <div class="tooltip-header">
            <span
              class="country-flag-badge"
              [style.background-color]="hoveredCountry.fillColor"
            ></span>
            <div class="tooltip-names">
              <h3 class="country-name">{{ hoveredCountry.name }}</h3>
              <span class="original-abbr" *ngIf="hoveredCountry.originalAbbr">
                {{ hoveredCountry.originalAbbr }}
              </span>
            </div>
          </div>

          <div class="tooltip-body">
            <!-- STATUS -->
            <div class="tooltip-row">
              <span class="row-label">Status:</span>
              <span
                class="status-pill"
                [class.subject]="hoveredCountry.isSubject"
                [class.independent]="!hoveredCountry.isSubject"
              >
                <span class="status-indicator"></span>
                {{ hoveredCountry.isSubject ? 'Podległe (' + hoveredCountry.overlord + ')' : 'Niepodległe' }}
              </span>
            </div>

            <!-- RULER -->
            <div class="tooltip-row" *ngIf="hoveredCountry.ruler">
              <span class="row-label">Władca / Rząd:</span>
              <span class="row-val font-semibold">{{ hoveredCountry.ruler }}</span>
            </div>

            <!-- POPULATION -->
            <div class="tooltip-row">
              <span class="row-label">Ludność:</span>
              <span class="row-val text-accent">{{ hoveredCountry.populationFormatted }}</span>
            </div>

            <!-- RELIGION -->
            <div class="tooltip-row">
              <span class="row-label">Religia:</span>
              <span class="row-val flex-inline">
                <span
                  class="religion-dot"
                  [style.background-color]="hoveredCountry.religionColor"
                ></span>
                {{ hoveredCountry.religion }}
              </span>
            </div>

            <!-- CAPITAL -->
            <div class="tooltip-row" *ngIf="hoveredCountry.capital">
              <span class="row-label">Stolica:</span>
              <span class="row-val">{{ hoveredCountry.capital }}</span>
            </div>

            <!-- DIPLOMATIC STANCE (In Diplomatic Mode) -->
            <div class="tooltip-diplomatic" *ngIf="activeMode === 'diplomatic' && selectedCountry">
              <div class="diplo-badge" [ngClass]="getDiplomaticRelationClass(hoveredCountry)">
                {{ getDiplomaticRelationLabel(hoveredCountry) }}
              </div>
            </div>
          </div>
        </div>

        <!-- SELECTED COUNTRY DOSSIER / SIDE PANEL -->
        <aside class="country-dossier" *ngIf="selectedCountry">
          <div class="dossier-header">
            <div class="dossier-title-wrap">
              <span
                class="dossier-color-swatch"
                [style.background-color]="selectedCountry.fillColor"
              ></span>
              <div>
                <h2>{{ selectedCountry.name }}</h2>
                <span class="dossier-subtitle">{{ selectedCountry.status }}</span>
              </div>
            </div>
            <button type="button" class="close-btn" (click)="selectedCountry = null">✕</button>
          </div>

          <div class="dossier-content">
            <div class="dossier-stat-grid">
              <div class="stat-card">
                <span class="stat-title">Władca</span>
                <span class="stat-value">{{ selectedCountry.ruler }}</span>
              </div>
              <div class="stat-card">
                <span class="stat-title">Szac. Ludność</span>
                <span class="stat-value text-accent">{{ selectedCountry.populationFormatted }}</span>
              </div>
              <div class="stat-card">
                <span class="stat-title">Dominująca Religia</span>
                <span class="stat-value">
                  <span
                    class="religion-dot"
                    [style.background-color]="selectedCountry.religionColor"
                  ></span>
                  {{ selectedCountry.religion }}
                </span>
              </div>
              <div class="stat-card">
                <span class="stat-title">Główny Ośrodek</span>
                <span class="stat-value">{{ selectedCountry.capital }}</span>
              </div>
            </div>

            <!-- Overlord context if subject -->
            <div class="dossier-box warning" *ngIf="selectedCountry.isSubject">
              <strong>Zależność lenna / kolonialna:</strong>
              <p>
                To terytorium podlega zwierzchnictwu suzerena:
                <strong>{{ selectedCountry.overlord }}</strong>.
                Zgodnie z zasadami heraldycznymi i mechaniką EU4, granica oraz nazwa są wyodrębnione, lecz barwa domeny odpowiada władcy zwierzchniemu.
              </p>
            </div>

            <!-- Diplomatic Alliances & Wars -->
            <div class="dossier-section">
              <h3 class="section-title">🛡️ Sojusze i Pakt Obronny</h3>
              <div class="tag-list" *ngIf="selectedCountry.allies && selectedCountry.allies.length > 0">
                <span class="tag ally" *ngFor="let ally of selectedCountry.allies">
                  {{ ally }}
                </span>
              </div>
              <p class="empty-sub" *ngIf="!selectedCountry.allies || selectedCountry.allies.length === 0">
                Brak zarejestrowanych formalnych sojuszników w tym okresie.
              </p>
            </div>

            <div class="dossier-section">
              <h3 class="section-title">⚔️ Aktywne Konflikty i Wojny</h3>
              <div class="tag-list" *ngIf="selectedCountry.enemies && selectedCountry.enemies.length > 0">
                <span class="tag enemy" *ngFor="let enemy of selectedCountry.enemies">
                  {{ enemy }}
                </span>
              </div>
              <p class="empty-sub" *ngIf="!selectedCountry.enemies || selectedCountry.enemies.length === 0">
                Pokój lub brak wielkich wojen koalicyjnych w tym roku.
              </p>
            </div>

            <div class="dossier-hint">
              <small>Wciśnij <strong>[E]</strong>, by podświetlić relacje dyplomatyczne na całej mapie świata.</small>
            </div>
          </div>
        </aside>

        <!-- RELIGIONS LEGEND (W Mode) -->
        <div class="map-legend" *ngIf="activeMode === 'religious'">
          <div class="legend-header">
            <h4>Paleta Religii (EU4)</h4>
            <span class="legend-sub">Wciśnij Q, by wrócić do politycznej</span>
          </div>
          <div class="legend-items">
            <div class="legend-item" *ngFor="let rel of religionList">
              <span class="legend-swatch" [style.background-color]="rel.color"></span>
              <span class="legend-name">{{ rel.name }}</span>
            </div>
          </div>
        </div>

        <!-- DIPLOMATIC LEGEND (E Mode) -->
        <div class="map-legend diplomatic-legend" *ngIf="activeMode === 'diplomatic'">
          <div class="legend-header">
            <h4>Legenda Dyplomatyczna</h4>
            <span class="legend-sub">
              {{ selectedCountry ? 'Wybrano: ' + selectedCountry.name : 'Kliknij na państwo, aby zbadać sojusze i wojny' }}
            </span>
          </div>
          <div class="legend-items">
            <div class="legend-item">
              <span class="legend-swatch blue"></span>
              <span>Wybrane Państwo</span>
            </div>
            <div class="legend-item">
              <span class="legend-swatch green"></span>
              <span>Sojusznicy</span>
            </div>
            <div class="legend-item">
              <span class="legend-swatch red"></span>
              <span>Wrogowie / Toczone Wojny</span>
            </div>
            <div class="legend-item">
              <span class="legend-swatch cyan"></span>
              <span>Wasale i Kolonie</span>
            </div>
            <div class="legend-item">
              <span class="legend-swatch gray"></span>
              <span>Państwa Neutralne</span>
            </div>
          </div>
        </div>

        <!-- GREAT POWERS LEDGER DRAWER -->
        <aside class="great-powers-ledger" *ngIf="showGreatPowers">
          <div class="ledger-header">
            <div class="ledger-title-group">
              <span class="ledger-crown">👑</span>
              <div>
                <h3>Wielkie Mocarstwa Świata</h3>
                <span class="ledger-subtitle">
                  Rok {{ getFormattedYear(currentEra?.year) }} – Top 8 Potęg Świata (EU4 Ledger)
                </span>
              </div>
            </div>
            <button type="button" class="close-btn" (click)="showGreatPowers = false">✕</button>
          </div>

          <div class="ledger-list">
            <button
              type="button"
              class="ledger-card"
              *ngFor="let power of greatPowersList; let i = index"
              (click)="selectCountry(power)"
              [class.selected]="selectedCountry?.name === power.name"
            >
              <div class="rank-badge" [ngClass]="getRankClass(i)">
                {{ getRankSymbol(i) }}
              </div>
              <span class="power-flag" [style.background-color]="power.fillColor"></span>
              <div class="power-info">
                <div class="power-top">
                  <span class="power-name">{{ power.name }}</span>
                  <span class="power-pop">{{ power.populationFormatted }}</span>
                </div>
                <div class="power-bottom">
                  <span class="power-ruler">{{ power.ruler }}</span>
                  <span class="power-rel">
                    <span class="rel-pip" [style.background-color]="power.religionColor"></span>
                    {{ power.religion }}
                  </span>
                </div>
              </div>
            </button>
          </div>
          <div class="ledger-footer">
            <small>Kliknij mocarstwo, by nakierować kamerę i zbadać dyplomację.</small>
          </div>
        </aside>
      </div>

      <!-- BOTTOM TIMELINE SCRUBBER -->
      <footer class="history-timeline">
        <div class="timeline-controls-bar">
          <!-- Step back group -->
          <div class="step-btn-group">
            <button type="button" class="step-btn" (click)="stepYears(-100)" title="-100 lat">-100</button>
            <button type="button" class="step-btn" (click)="stepYears(-10)" title="-10 lat">-10</button>
            <button type="button" class="step-btn" (click)="stepYears(-1)" title="-1 rok">-1</button>
          </div>

          <!-- Play button -->
          <button
            type="button"
            class="play-btn"
            [class.playing]="isPlaying"
            (click)="togglePlay()"
            title="Autoodtwarzanie osi czasu (Spacja)"
          >
            {{ isPlaying ? '❚❚ Pauza' : '▶ Odtwarzaj' }}
          </button>

          <!-- Step forward group -->
          <div class="step-btn-group">
            <button type="button" class="step-btn" (click)="stepYears(1)" title="+1 rok">+1</button>
            <button type="button" class="step-btn" (click)="stepYears(10)" title="+10 lat">+10</button>
            <button type="button" class="step-btn" (click)="stepYears(100)" title="+100 lat">+100</button>
          </div>

          <!-- Direct Year Input Field -->
          <div class="direct-year-box" title="Wpisz dowolny rok i zatwierdź Enterem">
            <span class="input-label">Rok:</span>
            <input
              type="number"
              class="direct-year-input"
              [(ngModel)]="directYearInput"
              (keydown.enter)="onDirectYearSubmit(directYearInput)"
              (blur)="onDirectYearSubmit(directYearInput)"
              min="-1000"
              max="2024"
            />
            <button
              type="button"
              class="direct-year-go"
              (click)="onDirectYearSubmit(directYearInput)"
              title="Przejdź do wpisanego roku"
            >
              ➔
            </button>
          </div>
        </div>

        <!-- RANGE SLIDER -->
        <div class="slider-wrapper">
          <input
            type="range"
            [min]="minYear"
            [max]="maxYear"
            step="1"
            [ngModel]="selectedYear"
            (input)="onYearSliderInput($any($event.target).value)"
            (change)="onYearSliderChange($any($event.target).value)"
            class="timeline-slider"
          />

          <!-- KEY LANDMARK CHIPS -->
          <div class="milestones-track">
            <button
              type="button"
              *ngFor="let year of landmarkYears"
              class="milestone-chip"
              [class.active]="selectedYear === year || currentEra?.year === year"
              (click)="jumpToExactYear(year)"
            >
              <span class="milestone-year">{{ formatChipYear(year) }}</span>
            </button>
          </div>
        </div>

        <!-- HISTORICAL EVENT CARD (When matched for current year) -->
        <div class="timeline-event-card" *ngIf="matchedEvent">
          <div class="event-icon-badge">{{ matchedEvent.icon }}</div>
          <div class="event-content">
            <div class="event-meta">
              <span class="event-scope-badge" [class.polska]="matchedEvent.scope === 'polska'">
                {{ matchedEvent.scope === 'polska' ? '🇵🇱 POLSKA' : '🌍 ŚWIAT' }}
              </span>
              <span class="event-year-pill">{{ getFormattedYear(matchedEvent.year) }}</span>
            </div>
            <strong class="event-title">{{ matchedEvent.title }}</strong>
            <p class="event-desc">{{ matchedEvent.desc }}</p>
          </div>
        </div>

        <!-- ERA SYNOPSIS TOGGLE -->
        <div class="timeline-synopsis" *ngIf="currentEra">
          <p class="synopsis-text">
            <span class="epoch-tag">{{ currentEra.epoch }}</span>
            <strong>{{ currentEra.title }}:</strong> {{ currentEra.desc }}
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .history-page {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 75px);
      width: 100%;
      background-color: #0b0e14;
      color: #e6edf3;
      position: relative;
      overflow: hidden;
      font-family: var(--font-sans, system-ui, sans-serif);
    }

    .history-page.is-fullscreen {
      position: fixed;
      inset: 0;
      z-index: 9999;
      height: 100vh;
      width: 100vw;
    }

    /* TOP HUD */
    .history-hud {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
      padding: 0.75rem 1.5rem;
      background: rgba(18, 22, 31, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      z-index: 50;
      flex-wrap: wrap;
    }

    .hud-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .hud-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.25rem 0.6rem;
      background: rgba(255, 122, 0, 0.12);
      border: 1px solid rgba(255, 122, 0, 0.35);
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #ff9124;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      background: #ff7a00;
      border-radius: 50%;
      box-shadow: 0 0 8px #ff7a00;
    }

    .era-title-group {
      display: flex;
      align-items: baseline;
      gap: 0.6rem;
    }

    .hud-year {
      font-size: 1.45rem;
      font-weight: 800;
      margin: 0;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    .hud-epoch {
      font-size: 0.85rem;
      color: #8b949e;
      font-weight: 500;
    }

    /* MODES */
    .hud-modes {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(0, 0, 0, 0.35);
      padding: 0.25rem;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .mode-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.75rem;
      background: transparent;
      border: none;
      border-radius: 7px;
      color: #8b949e;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .mode-btn:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.06);
    }

    .mode-btn.active {
      background: #ff7a00;
      color: #ffffff;
      box-shadow: 0 2px 10px rgba(255, 122, 0, 0.35);
    }

    .key-badge {
      display: inline-block;
      padding: 0.1rem 0.35rem;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .mode-btn.active .key-badge {
      background: rgba(0, 0, 0, 0.25);
      border-color: rgba(255, 255, 255, 0.3);
    }

    /* SEARCH & ACTIONS */
    .hud-right {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .great-powers-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.38rem 0.8rem;
      background: rgba(241, 196, 15, 0.12);
      border: 1px solid rgba(241, 196, 15, 0.35);
      border-radius: 8px;
      color: #f1c40f;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .great-powers-btn:hover {
      background: rgba(241, 196, 15, 0.22);
      border-color: #f1c40f;
      color: #ffffff;
      box-shadow: 0 2px 10px rgba(241, 196, 15, 0.3);
    }

    .great-powers-btn.active {
      background: #f1c40f;
      color: #1a1a1a;
      box-shadow: 0 0 15px rgba(241, 196, 15, 0.5);
    }

    .gp-count {
      display: inline-block;
      padding: 0.05rem 0.35rem;
      background: rgba(0, 0, 0, 0.35);
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 800;
    }

    .great-powers-btn.active .gp-count {
      background: rgba(0, 0, 0, 0.25);
      color: #1a1a1a;
    }

    .search-box {
      position: relative;
    }

    .hud-input {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 0.4rem 0.8rem;
      color: #ffffff;
      font-size: 0.85rem;
      width: 170px;
      transition: all 0.2s ease;
      outline: none;
    }

    .hud-input:focus {
      width: 220px;
      border-color: #ff7a00;
      background: rgba(0, 0, 0, 0.6);
    }

    .search-dropdown {
      position: absolute;
      top: calc(100% + 5px);
      left: 0;
      right: 0;
      background: #181d28;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      max-height: 240px;
      overflow-y: auto;
      z-index: 100;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
    }

    .search-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      width: 100%;
      padding: 0.5rem 0.75rem;
      background: transparent;
      border: none;
      color: #e6edf3;
      font-size: 0.82rem;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s ease;
    }

    .search-item:hover {
      background: rgba(255, 122, 0, 0.15);
      color: #ff9124;
    }

    .item-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .item-status {
      font-size: 0.7rem;
      color: #8b949e;
      margin-left: auto;
    }

    .icon-action-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #c9d1d9;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .icon-action-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
    }

    /* MAP VIEWPORT */
    .map-viewport {
      flex: 1;
      position: relative;
      width: 100%;
      min-height: 200px;
      background-color: #0b0e14;
    }

    .map-canvas {
      width: 100%;
      height: 100%;
    }

    /* LOADING SPINNER */
    .loading-overlay {
      position: absolute;
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(14, 18, 25, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 30px;
      padding: 0.5rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.85rem;
      color: #c9d1d9;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      z-index: 40;
      backdrop-filter: blur(8px);
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: #ff7a00;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* FLOATING TOOLTIP (DYMEK) */
    .map-tooltip {
      position: absolute;
      transform: translate(15px, 15px);
      background: rgba(18, 23, 33, 0.96);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(0, 0, 0, 0.5);
      padding: 0.85rem 1rem;
      pointer-events: none;
      z-index: 90;
      min-width: 250px;
      max-width: 320px;
      backdrop-filter: blur(10px);
      transition: transform 0.05s linear;
    }

    .tooltip-header {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      margin-bottom: 0.65rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .country-flag-badge {
      width: 14px;
      height: 14px;
      border-radius: 3px;
      flex-shrink: 0;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
    }

    .tooltip-names {
      line-height: 1.2;
    }

    .country-name {
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .original-abbr {
      font-size: 0.72rem;
      color: #8b949e;
    }

    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.8rem;
    }

    .tooltip-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.6rem;
    }

    .row-label {
      color: #8b949e;
      font-weight: 500;
    }

    .row-val {
      color: #e6edf3;
      text-align: right;
    }

    .font-semibold {
      font-weight: 600;
    }

    .text-accent {
      color: #ff9124;
      font-weight: 600;
    }

    .flex-inline {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .religion-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 600;
    }

    .status-pill.independent {
      background: rgba(39, 174, 96, 0.18);
      color: #2ecc71;
      border: 1px solid rgba(46, 204, 113, 0.35);
    }

    .status-pill.subject {
      background: rgba(241, 196, 15, 0.18);
      color: #f1c40f;
      border: 1px solid rgba(241, 196, 15, 0.4);
    }

    .status-indicator {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
    }

    .tooltip-diplomatic {
      margin-top: 0.4rem;
      padding-top: 0.4rem;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
    }

    .diplo-badge {
      display: inline-block;
      width: 100%;
      text-align: center;
      padding: 0.25rem 0.4rem;
      border-radius: 5px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .diplo-badge.self { background: rgba(30, 136, 229, 0.25); color: #64b5f6; border: 1px solid #1e88e5; }
    .diplo-badge.ally { background: rgba(39, 174, 96, 0.25); color: #2ecc71; border: 1px solid #27ae60; }
    .diplo-badge.enemy { background: rgba(231, 76, 60, 0.25); color: #ff6b6b; border: 1px solid #e74c3c; }
    .diplo-badge.vassal { background: rgba(0, 206, 201, 0.25); color: #81ecec; border: 1px solid #00cec9; }
    .diplo-badge.neutral { background: rgba(255, 255, 255, 0.05); color: #8b949e; border: 1px solid rgba(255, 255, 255, 0.1); }

    /* DOSSIER PANEL */
    .country-dossier {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 340px;
      max-height: calc(100% - 2rem);
      background: rgba(18, 23, 33, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(14px);
      z-index: 60;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .dossier-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.2);
    }

    .dossier-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .dossier-color-swatch {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .dossier-header h2 {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0;
      color: #ffffff;
      line-height: 1.2;
    }

    .dossier-subtitle {
      font-size: 0.75rem;
      color: #ff9124;
      font-weight: 600;
    }

    .close-btn {
      background: transparent;
      border: none;
      color: #8b949e;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
    }

    .close-btn:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }

    .dossier-content {
      padding: 1rem 1.25rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .dossier-stat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.6rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 0.6rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .stat-title {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #8b949e;
      font-weight: 600;
    }

    .stat-value {
      font-size: 0.85rem;
      font-weight: 700;
      color: #f0f6fc;
    }

    .dossier-box.warning {
      background: rgba(241, 196, 15, 0.08);
      border: 1px solid rgba(241, 196, 15, 0.25);
      border-radius: 8px;
      padding: 0.75rem;
      font-size: 0.8rem;
      line-height: 1.45;
      color: #f1c40f;
    }

    .dossier-section {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .section-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: #c9d1d9;
      margin: 0;
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .tag {
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .tag.ally {
      background: rgba(39, 174, 96, 0.2);
      color: #2ecc71;
      border: 1px solid rgba(46, 204, 113, 0.3);
    }

    .tag.enemy {
      background: rgba(231, 76, 60, 0.2);
      color: #ff6b6b;
      border: 1px solid rgba(231, 76, 60, 0.3);
    }

    .empty-sub {
      font-size: 0.75rem;
      color: #8b949e;
      margin: 0;
      font-style: italic;
    }

    .dossier-hint {
      margin-top: auto;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      color: #8b949e;
      font-size: 0.75rem;
    }

    /* GREAT POWERS LEDGER */
    .great-powers-ledger {
      position: absolute;
      top: 1rem;
      left: 1rem;
      width: 360px;
      max-height: calc(100% - 2rem);
      background: rgba(18, 23, 33, 0.96);
      border: 1px solid rgba(241, 196, 15, 0.35);
      border-radius: 12px;
      box-shadow: 0 16px 45px rgba(0, 0, 0, 0.75), 0 0 15px rgba(241, 196, 15, 0.15);
      backdrop-filter: blur(14px);
      z-index: 60;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .ledger-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.9rem 1.2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: linear-gradient(135deg, rgba(241, 196, 15, 0.15), rgba(0, 0, 0, 0.4));
    }

    .ledger-title-group {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .ledger-crown {
      font-size: 1.4rem;
    }

    .ledger-header h3 {
      font-size: 1.05rem;
      font-weight: 800;
      margin: 0;
      color: #f1c40f;
      letter-spacing: -0.3px;
    }

    .ledger-subtitle {
      font-size: 0.72rem;
      color: #8b949e;
      display: block;
    }

    .ledger-list {
      padding: 0.6rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .ledger-card {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.6rem 0.75rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      color: #e6edf3;
      cursor: pointer;
      text-align: left;
      transition: all 0.18s ease;
      width: 100%;
    }

    .ledger-card:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(241, 196, 15, 0.35);
      transform: translateX(3px);
    }

    .ledger-card.selected {
      background: rgba(30, 136, 229, 0.18);
      border-color: #1e88e5;
    }

    .rank-badge {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .rank-badge.rank-gold { background: rgba(241, 196, 15, 0.25); color: #f1c40f; border: 1px solid #f1c40f; }
    .rank-badge.rank-silver { background: rgba(189, 195, 199, 0.25); color: #bdc3c7; border: 1px solid #bdc3c7; }
    .rank-badge.rank-bronze { background: rgba(211, 84, 0, 0.25); color: #e67e22; border: 1px solid #e67e22; }
    .rank-badge.rank-regular { background: rgba(255, 255, 255, 0.06); color: #8b949e; border: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.75rem; }

    .power-flag {
      width: 12px;
      height: 32px;
      border-radius: 3px;
      flex-shrink: 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .power-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 0;
    }

    .power-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.4rem;
    }

    .power-name {
      font-weight: 700;
      font-size: 0.88rem;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .power-pop {
      font-size: 0.72rem;
      color: #ff9124;
      font-weight: 700;
      white-space: nowrap;
    }

    .power-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.72rem;
      color: #8b949e;
    }

    .power-ruler {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 150px;
    }

    .power-rel {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .rel-pip {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .ledger-footer {
      padding: 0.5rem 0.8rem;
      background: rgba(0, 0, 0, 0.2);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      text-align: center;
      color: #8b949e;
      font-size: 0.72rem;
    }

    /* LEGENDS */
    .map-legend {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      background: rgba(18, 23, 33, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(10px);
      z-index: 50;
      max-width: 280px;
    }

    .legend-header h4 {
      font-size: 0.85rem;
      font-weight: 700;
      margin: 0 0 0.15rem;
      color: #ffffff;
    }

    .legend-sub {
      font-size: 0.7rem;
      color: #8b949e;
      display: block;
      margin-bottom: 0.5rem;
    }

    .legend-items {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.35rem 0.75rem;
      font-size: 0.75rem;
      color: #c9d1d9;
    }

    .diplomatic-legend .legend-items {
      grid-template-columns: 1fr;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .legend-swatch {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .legend-swatch.blue { background: #1e88e5; }
    .legend-swatch.green { background: #27ae60; }
    .legend-swatch.red { background: #e74c3c; }
    .legend-swatch.cyan { background: #00cec9; }
    .legend-swatch.gray { background: #4a4e54; }

    /* BOTTOM TIMELINE */
    .history-timeline {
      background: rgba(18, 22, 31, 0.97);
      backdrop-filter: blur(14px);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.65rem 1.5rem 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 50;
    }

    .timeline-controls-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .step-btn-group {
      display: inline-flex;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      padding: 2px;
      gap: 2px;
    }

    .step-btn {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: #8b949e;
      background: transparent;
      border: none;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.15s ease;
    }

    .step-btn:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.12);
    }

    .direct-year-box {
      display: inline-flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      padding: 0.15rem 0.4rem;
      gap: 0.35rem;
    }

    .input-label {
      font-size: 0.75rem;
      color: #8b949e;
      font-weight: 600;
    }

    .direct-year-input {
      width: 70px;
      background: transparent;
      border: none;
      color: #ff9124;
      font-weight: 800;
      font-size: 0.95rem;
      text-align: center;
      outline: none;
      font-family: inherit;
    }

    .direct-year-input::-webkit-inner-spin-button,
    .direct-year-input::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .direct-year-go {
      background: #ff7a00;
      color: #ffffff;
      border: none;
      border-radius: 4px;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.8rem;
      transition: background 0.15s ease;
    }

    .direct-year-go:hover {
      background: #e06c00;
    }

    .play-btn {
      padding: 0.35rem 1.1rem;
      background: #ff7a00;
      border: none;
      border-radius: 8px;
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s ease;
      box-shadow: 0 2px 10px rgba(255, 122, 0, 0.3);
    }

    .play-btn:hover {
      background: #e06c00;
      transform: translateY(-1px);
    }

    .play-btn.playing {
      background: #e74c3c;
      box-shadow: 0 2px 10px rgba(231, 76, 60, 0.3);
    }

    .slider-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .timeline-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.12);
      outline: none;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .timeline-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #ff7a00;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(255, 122, 0, 0.7);
      border: 2px solid #ffffff;
      transition: transform 0.1s ease;
    }

    .timeline-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }

    .milestones-track {
      display: flex;
      justify-content: space-between;
      overflow-x: auto;
      padding-bottom: 0.15rem;
      gap: 0.25rem;
    }

    .milestone-chip {
      background: transparent;
      border: none;
      color: #8b949e;
      font-size: 0.72rem;
      padding: 0.15rem 0.35rem;
      cursor: pointer;
      border-radius: 4px;
      white-space: nowrap;
      transition: all 0.15s ease;
      font-weight: 500;
    }

    .milestone-chip:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.08);
    }

    .milestone-chip.active {
      color: #ff9124;
      font-weight: 700;
      background: rgba(255, 122, 0, 0.15);
    }

    /* HISTORICAL EVENT CARD */
    .timeline-event-card {
      background: linear-gradient(135deg, rgba(255, 122, 0, 0.12) 0%, rgba(20, 24, 33, 0.95) 100%);
      border: 1px solid rgba(255, 122, 0, 0.35);
      border-radius: 8px;
      padding: 0.4rem 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      animation: fadeIn 0.25s ease;
    }

    .event-icon-badge {
      font-size: 1.4rem;
      line-height: 1;
      flex-shrink: 0;
    }

    .event-content {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      text-align: left;
      min-width: 0;
    }

    .event-meta {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .event-scope-badge {
      font-size: 0.62rem;
      font-weight: 800;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      text-transform: uppercase;
      background: rgba(52, 152, 219, 0.25);
      color: #3498db;
    }

    .event-scope-badge.polska {
      background: rgba(220, 75, 100, 0.25);
      color: #dc4b64;
      border: 1px solid rgba(220, 75, 100, 0.4);
    }

    .event-year-pill {
      font-size: 0.72rem;
      font-weight: 700;
      color: #ff9124;
    }

    .event-title {
      font-size: 0.85rem;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .event-desc {
      font-size: 0.75rem;
      color: #c9d1d9;
      margin: 0;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .timeline-synopsis {
      text-align: center;
      max-width: 900px;
      margin: 0 auto;
      padding-top: 0.1rem;
    }

    .synopsis-text {
      font-size: 0.78rem;
      color: #8b949e;
      line-height: 1.35;
      margin: 0;
    }

    .synopsis-text strong {
      color: #e6edf3;
    }

    .epoch-tag {
      display: inline-block;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.05rem 0.35rem;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.08);
      color: #ff9124;
      margin-right: 0.35rem;
    }

    @media (max-width: 900px) {
      .history-hud {
        padding: 0.5rem 1rem;
        gap: 0.5rem;
      }
      .hud-modes .mode-label {
        display: none;
      }
      .country-dossier {
        width: calc(100% - 2rem);
        max-height: 50%;
        bottom: 120px;
        top: auto;
      }
      .milestones-track {
        display: none;
      }
    }
  `]
})
export class HistoryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  map: MapLibreMap | null = null;
  mapLibreModule: any = null;

  eras: EraItem[] = [];
  currentEraIndex = 24; // Default to 1492
  currentEra: EraItem | null = null;

  // Continuous Year Navigation & Events
  selectedYear = 1492;
  minYear = -1000;
  maxYear = 2024;
  directYearInput = 1492;
  matchedEvent: HistoricalEvent | null = null;
  private eraDebounceTimer: any = null;

  landmarkYears: number[] = [
    -1000, -700, -500, -323, -1, 500, 800, 1000, 1279, 1410, 1492, 1525, 1569, 1600, 1683, 1791, 1815, 1918, 1939, 1989, 2010
  ];

  activeMode: MapMode = 'political';
  isLoading = false;
  isPlaying = false;
  isFullscreen = false;
  playTimer: any = null;

  hoveredCountry: CountryProperties | null = null;
  selectedCountry: CountryProperties | null = null;
  tooltipX = 0;
  tooltipY = 0;

  searchFilter = '';
  searchResults: CountryProperties[] = [];
  currentEraFeatures: CountryProperties[] = [];

  // Great Powers Ledger (EU4)
  showGreatPowers = true;
  greatPowersList: CountryProperties[] = [];

  // GeoJSON Cache in memory for instant switching
  private geojsonCache = new Map<string, any>();
  private currentRawGeojson: any = null;

  // EU4 Religion Palette for Legend
  religionList = [
    { name: 'Katolicyzm', color: '#e6ca65' },
    { name: 'Protestantyzm', color: '#2f70af' },
    { name: 'Kalwinizm / Reformacja', color: '#45b3e0' },
    { name: 'Prawosławie', color: '#b87333' },
    { name: 'Sunnizm', color: '#27ae60' },
    { name: 'Szyizm', color: '#c0392b' },
    { name: 'Buddyzm', color: '#e67e22' },
    { name: 'Hinduizm', color: '#9b59b6' },
    { name: 'Konfucjanizm / Taoizm', color: '#d4ac0d' },
    { name: 'Szintoizm', color: '#e84393' },
    { name: 'Pogaństwo / Szamanizm', color: '#7f8c8d' }
  ];

  toggleGreatPowers(): void {
    this.showGreatPowers = !this.showGreatPowers;
  }

  private computeGreatPowers(features: CountryProperties[]): void {
    const map = new Map<string, CountryProperties>();
    for (const p of features) {
      if (p.isSubject) continue;
      if (!p.name || p.name.includes('Terra') || p.name.includes('Unknown') || p.name.length < 3) continue;
      if (!map.has(p.name)) {
        map.set(p.name, p);
      } else {
        const existing = map.get(p.name)!;
        if (p.population > existing.population) {
          map.set(p.name, p);
        }
      }
    }
    this.greatPowersList = Array.from(map.values())
      .sort((a, b) => b.population - a.population)
      .slice(0, 8);
  }

  getRankClass(index: number): string {
    if (index === 0) return 'rank-gold';
    if (index === 1) return 'rank-silver';
    if (index === 2) return 'rank-bronze';
    return 'rank-regular';
  }

  getRankSymbol(index: number): string {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  }

  ngOnInit(): void {
    this.titleService.setTitle('Historia Świata – Interaktywny Atlas Historyczny | Giercujemy');
    this.metaService.updateTag({
      name: 'description',
      content: 'Eksploruj historię świata na interaktywnej mapie z barwami państw i religii EU4, granicami lennymi i suwakiem czasu.'
    });

    this.loadErasIndex();
  }

  private onWindowResize = () => {
    this.map?.resize();
  };

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
      window.addEventListener('resize', this.onWindowResize);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.onWindowResize);
    }
    if (this.playTimer) {
      clearInterval(this.playTimer);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key === 'q') {
      this.setMode('political');
    } else if (key === 'w') {
      this.setMode('religious');
    } else if (key === 'e') {
      this.setMode('diplomatic');
    } else if (key === 'r') {
      this.setMode('terrain');
    } else if (key === ' ') {
      event.preventDefault();
      this.togglePlay();
    } else if (key === 'arrowleft') {
      event.preventDefault();
      this.stepYears(event.shiftKey ? -50 : -10);
    } else if (key === 'arrowright') {
      event.preventDefault();
      this.stepYears(event.shiftKey ? 50 : 10);
    } else if (key === '[' || key === '{') {
      this.stepYears(-1);
    } else if (key === ']' || key === '}') {
      this.stepYears(1);
    } else if (key === 'escape') {
      this.selectedCountry = null;
      this.hoveredCountry = null;
      if (this.activeMode === 'diplomatic') {
        this.updateMapModeStyles();
      }
    }
  }

  private loadErasIndex(): void {
    this.http.get<EraItem[]>('/data/history/index.json').subscribe({
      next: data => {
        this.eras = data;
        const matchedEra = this.findEraForYear(this.selectedYear);
        this.currentEra = matchedEra;
        this.currentEraIndex = this.eras.indexOf(matchedEra);
        this.matchedEvent = findHistoricalEvent(this.selectedYear);
        if (this.map && this.map.isStyleLoaded()) {
          this.loadEraData(this.currentEra);
        }
      },
      error: err => {
        console.error('Failed to load eras index:', err);
      }
    });
  }

  private async initMap(): Promise<void> {
    try {
      const maplibre = await import('maplibre-gl');
      this.mapLibreModule = maplibre;

      if (typeof (maplibre as any).setWorkerUrl === 'function') {
        (maplibre as any).setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
      }

      const styleSpec: any = {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          'esri-physical': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Esri, USGS, NOAA'
          },
          'history-borders': {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          }
        },
        layers: [
          {
            id: 'ocean-background',
            type: 'background',
            paint: {
              'background-color': '#0d131a'
            }
          },
          {
            id: 'terrain-layer',
            type: 'raster',
            source: 'esri-physical',
            layout: {
              visibility: 'none'
            },
            paint: {
              'raster-opacity': 0.85
            }
          },
          {
            id: 'countries-fill',
            type: 'fill',
            source: 'history-borders',
            paint: {
              'fill-color': ['get', 'fillColor'],
              'fill-opacity': 0.75
            }
          },
          {
            id: 'countries-border',
            type: 'line',
            source: 'history-borders',
            paint: {
              'line-color': '#090d12',
              'line-width': 0.8
            }
          },
          {
            id: 'countries-subject-border',
            type: 'line',
            source: 'history-borders',
            filter: ['==', ['get', 'isSubject'], true],
            paint: {
              'line-color': '#f1c40f',
              'line-width': 1.2,
              'line-dasharray': [2, 2]
            }
          },
          {
            id: 'countries-hover-outline',
            type: 'line',
            source: 'history-borders',
            filter: ['==', ['get', 'id'], -1],
            paint: {
              'line-color': '#ffffff',
              'line-width': 2.5
            }
          },
          {
            id: 'countries-label',
            type: 'symbol',
            source: 'history-borders',
            minzoom: 2,
            layout: {
              'text-field': ['get', 'name'],
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
              'text-size': [
                'interpolate', ['linear'], ['zoom'],
                2, 10,
                5, 13,
                8, 16
              ],
              'text-max-width': 8,
              'symbol-placement': 'point'
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': '#000000',
              'text-halo-width': 1.5,
              'text-halo-blur': 1
            }
          }
        ]
      };

      this.map = new maplibre.Map({
        container: this.mapContainer.nativeElement,
        style: styleSpec,
        center: [19.0, 48.0], // Centered on Europe / Poland
        zoom: 3.2,
        minZoom: 1.5,
        maxZoom: 10
      });

      this.map.addControl(new maplibre.NavigationControl({ showCompass: true }), 'top-right');

      this.map.on('load', () => {
        if (this.currentEra) {
          this.loadEraData(this.currentEra);
        }
      });

      // Interactive mouse hover (Dymek)
      this.map.on('mousemove', 'countries-fill', (e: any) => {
        if (e.features && e.features.length > 0) {
          this.map!.getCanvas().style.cursor = 'pointer';
          const props = e.features[0].properties as CountryProperties;
          this.hoveredCountry = props;

          const rect = this.mapContainer.nativeElement.getBoundingClientRect();
          const maxX = Math.max(10, rect.width - 340);
          const maxY = Math.max(10, rect.height - 280);
          this.tooltipX = Math.max(10, Math.min(e.point.x + 15, maxX));
          this.tooltipY = Math.max(10, Math.min(e.point.y + 15, maxY));

          this.map!.setFilter('countries-hover-outline', ['==', ['get', 'id'], props.id]);
        }
      });

      this.map.on('mouseleave', 'countries-fill', () => {
        this.map!.getCanvas().style.cursor = '';
        this.hoveredCountry = null;
        this.map!.setFilter('countries-hover-outline', ['==', ['get', 'id'], -1]);
      });

      // Interactive click (Select Country / Diplomatic Target)
      this.map.on('click', 'countries-fill', (e: any) => {
        if (e.features && e.features.length > 0) {
          const props = e.features[0].properties as CountryProperties;
          this.selectCountry(props);
        }
      });

      // Click on blank map deselects
      this.map.on('click', (e: any) => {
        const features = this.map!.queryRenderedFeatures(e.point, { layers: ['countries-fill'] });
        if (!features || features.length === 0) {
          this.selectedCountry = null;
          if (this.activeMode === 'diplomatic') {
            this.updateMapModeStyles();
          }
        }
      });

    } catch (err) {
      console.error('Error initializing MapLibre:', err);
    }
  }

  private loadEraData(era: EraItem): void {
    if (!this.map) return;

    this.isLoading = true;
    const url = `/data/history/${era.filename}`;

    if (this.geojsonCache.has(url)) {
      this.applyGeoJson(this.geojsonCache.get(url));
      this.isLoading = false;
      return;
    }

    this.http.get<any>(url).subscribe({
      next: data => {
        this.geojsonCache.set(url, data);
        this.applyGeoJson(data);
        this.isLoading = false;
      },
      error: err => {
        console.error(`Failed to load ${url}:`, err);
        this.isLoading = false;
      }
    });
  }

  private applyGeoJson(geojson: any): void {
    if (!this.map) return;
    this.currentRawGeojson = geojson;
    const source = this.map.getSource('history-borders') as GeoJSONSource;
    if (source) {
      source.setData(geojson);
    }

    // Cache features list for search
    this.currentEraFeatures = geojson.features.map((f: any) => f.properties);

    // Compute top 8 Great Powers of this era
    this.computeGreatPowers(this.currentEraFeatures);

    // Keep selected country updated if exists in new era
    if (this.selectedCountry) {
      const match = this.currentEraFeatures.find(f => f.name === this.selectedCountry!.name);
      this.selectedCountry = match || null;
    }

    this.updateMapModeStyles();
  }

  setMode(mode: MapMode): void {
    this.activeMode = mode;
    this.updateMapModeStyles();
  }

  private updateMapModeStyles(): void {
    if (!this.map || !this.map.isStyleLoaded()) return;

    const terrainVisibility = this.activeMode === 'terrain' ? 'visible' : 'none';
    this.map.setLayoutProperty('terrain-layer', 'visibility', terrainVisibility);

    if (this.activeMode === 'political') {
      this.map.setPaintProperty('countries-fill', 'fill-color', ['get', 'fillColor']);
      this.map.setPaintProperty('countries-fill', 'fill-opacity', 0.75);
    } else if (this.activeMode === 'religious') {
      this.map.setPaintProperty('countries-fill', 'fill-color', ['get', 'religionColor']);
      this.map.setPaintProperty('countries-fill', 'fill-opacity', 0.78);
    } else if (this.activeMode === 'terrain') {
      this.map.setPaintProperty('countries-fill', 'fill-color', ['get', 'fillColor']);
      this.map.setPaintProperty('countries-fill', 'fill-opacity', 0.28);
    } else if (this.activeMode === 'diplomatic') {
      if (!this.selectedCountry) {
        // All countries gray
        this.map.setPaintProperty('countries-fill', 'fill-color', '#3f434a');
        this.map.setPaintProperty('countries-fill', 'fill-opacity', 0.65);
      } else {
        const selName = this.selectedCountry.name;
        const allies = this.selectedCountry.allies || [];
        const enemies = this.selectedCountry.enemies || [];

        // Build MapLibre case expression for diplomatic stance
        // Selected: Blue (#1e88e5)
        // Allies: Vibrant Green (#27ae60)
        // Enemies: Blood Red (#e74c3c)
        // Vassals: Cyan (#00cec9)
        // Others: Muted Gray (#353940)
        const expression: any = [
          'case',
          ['==', ['get', 'name'], selName],
          '#1e88e5',
          ['in', ['get', 'name'], ['literal', allies]],
          '#27ae60',
          ['in', ['get', 'name'], ['literal', enemies]],
          '#e74c3c',
          ['==', ['get', 'overlord'], selName],
          '#00cec9',
          '#383c44'
        ];

        this.map.setPaintProperty('countries-fill', 'fill-color', expression);
        this.map.setPaintProperty('countries-fill', 'fill-opacity', 0.85);
      }
    }
  }

  selectCountry(country: CountryProperties): void {
    this.selectedCountry = country;
    if (this.activeMode === 'diplomatic') {
      this.updateMapModeStyles();
    }

    if (this.map && this.currentRawGeojson) {
      const feat = this.currentRawGeojson.features?.find((f: any) => f.properties?.id === country.id || f.properties?.name === country.name);
      if (feat && feat.geometry && feat.geometry.coordinates) {
        let center: [number, number] | null = null;
        if (feat.geometry.type === 'Polygon' && feat.geometry.coordinates[0]?.[0]) {
          center = feat.geometry.coordinates[0][0];
        } else if (feat.geometry.type === 'MultiPolygon' && feat.geometry.coordinates[0]?.[0]?.[0]) {
          center = feat.geometry.coordinates[0][0][0];
        }
        if (center && typeof center[0] === 'number') {
          this.map.flyTo({
            center: center,
            zoom: Math.max(this.map.getZoom(), 4.0),
            speed: 1.0
          });
        }
      }
    }
  }

  getDiplomaticRelationClass(target: CountryProperties): string {
    if (!this.selectedCountry) return 'neutral';
    if (target.name === this.selectedCountry.name) return 'self';
    if (this.selectedCountry.allies && this.selectedCountry.allies.includes(target.name)) return 'ally';
    if (this.selectedCountry.enemies && this.selectedCountry.enemies.includes(target.name)) return 'enemy';
    if (target.overlord === this.selectedCountry.name) return 'vassal';
    return 'neutral';
  }

  getDiplomaticRelationLabel(target: CountryProperties): string {
    if (!this.selectedCountry) return 'Neutralne';
    if (target.name === this.selectedCountry.name) return 'Wybrane Państwo';
    if (this.selectedCountry.allies && this.selectedCountry.allies.includes(target.name)) return 'Sojusznik (Pakt)';
    if (this.selectedCountry.enemies && this.selectedCountry.enemies.includes(target.name)) return 'W stanie wojny!';
    if (target.overlord === this.selectedCountry.name) return 'Wasal / Podległe';
    return 'Neutralne';
  }

  // Continuous Timeline Navigation
  findEraForYear(year: number): EraItem {
    if (!this.eras || this.eras.length === 0) return this.currentEra || ({} as EraItem);
    let matched = this.eras[0];
    for (const era of this.eras) {
      if (era.year <= year) {
        matched = era;
      } else {
        break;
      }
    }
    return matched;
  }

  onYearSliderInput(val: string | number): void {
    const year = Number(val);
    this.selectedYear = year;
    this.directYearInput = year;
    this.matchedEvent = findHistoricalEvent(year);

    const matchedEra = this.findEraForYear(year);
    if (!this.currentEra || this.currentEra.year !== matchedEra.year) {
      this.currentEra = matchedEra;
      this.currentEraIndex = this.eras.indexOf(matchedEra);

      if (this.eraDebounceTimer) {
        clearTimeout(this.eraDebounceTimer);
      }
      this.eraDebounceTimer = setTimeout(() => {
        this.loadEraData(matchedEra);
      }, 90);
    }
  }

  onYearSliderChange(val: string | number): void {
    if (this.eraDebounceTimer) {
      clearTimeout(this.eraDebounceTimer);
      this.eraDebounceTimer = null;
    }
    const year = Number(val);
    this.selectedYear = year;
    this.directYearInput = year;
    this.matchedEvent = findHistoricalEvent(year);
    const matchedEra = this.findEraForYear(year);
    this.currentEra = matchedEra;
    this.currentEraIndex = this.eras.indexOf(matchedEra);
    this.loadEraData(matchedEra);
  }

  onDirectYearSubmit(val: string | number): void {
    let year = parseInt(String(val), 10);
    if (isNaN(year)) return;
    year = Math.max(this.minYear, Math.min(this.maxYear, year));
    this.selectedYear = year;
    this.directYearInput = year;
    this.matchedEvent = findHistoricalEvent(year);
    const matchedEra = this.findEraForYear(year);
    this.currentEra = matchedEra;
    this.currentEraIndex = this.eras.indexOf(matchedEra);
    this.loadEraData(matchedEra);
  }

  stepYears(delta: number): void {
    this.onDirectYearSubmit(this.selectedYear + delta);
  }

  jumpToExactYear(year: number): void {
    this.onDirectYearSubmit(year);
  }

  togglePlay(): void {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.playTimer = setInterval(() => {
        if (this.selectedYear < this.maxYear) {
          const delta = this.selectedYear < 1000 ? 25 : (this.selectedYear < 1800 ? 10 : 5);
          const nextYear = Math.min(this.maxYear, this.selectedYear + delta);
          this.onDirectYearSubmit(nextYear);
        } else {
          this.onDirectYearSubmit(this.minYear);
        }
      }, 650);
    } else {
      if (this.playTimer) {
        clearInterval(this.playTimer);
        this.playTimer = null;
      }
    }
  }

  // Search Functionality
  onSearchInput(): void {
    const q = this.searchFilter.trim().toLowerCase();
    if (!q) {
      this.searchResults = [];
      return;
    }

    this.searchResults = this.currentEraFeatures
      .filter(f => f.name.toLowerCase().includes(q))
      .slice(0, 8);
  }

  selectSearchResult(country: CountryProperties): void {
    this.selectCountry(country);
    this.searchFilter = '';
    this.searchResults = [];
  }

  resetView(): void {
    if (this.map) {
      this.map.flyTo({
        center: [19.0, 48.0],
        zoom: 3.2,
        speed: 1.2
      });
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    setTimeout(() => {
      if (this.map) {
        this.map.resize();
      }
    }, 150);
  }

  getFormattedYear(year: number | undefined): string {
    if (year === undefined) return '';
    if (year < 0) return `${Math.abs(year)} p.n.e.`;
    return `${year} n.e.`;
  }

  formatChipYear(year: number): string {
    if (year < 0) return `${Math.abs(year)} pne`;
    return `${year}`;
  }
}
