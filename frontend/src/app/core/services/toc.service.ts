import { Injectable, signal } from '@angular/core';

export interface TocItem {
  id: string;
  text: string;
  level: 1 | 2; // 1 = Główny rozdział (huge / h1 / h2), 2 = Podrozdział (large / h3 / h4)
}

@Injectable({
  providedIn: 'root',
})
export class TocService {
  readonly tocItems = signal<TocItem[]>([]);
  readonly activeId = signal<string | null>(null);

  setItems(items: TocItem[]): void {
    this.tocItems.set(items);
    if (items.length > 0 && !this.activeId()) {
      this.activeId.set(items[0].id);
    }
  }

  setActiveId(id: string | null): void {
    this.activeId.set(id);
  }

  clear(): void {
    this.tocItems.set([]);
    this.activeId.set(null);
  }

  scrollTo(id: string): void {
    this.activeId.set(id);
    const element = document.getElementById(id);
    if (element) {
      // If heading is inside a closed spoiler, reveal it
      const spoiler = element.closest('.spoiler-box');
      if (spoiler && !spoiler.classList.contains('revealed')) {
        spoiler.classList.add('revealed');
      }

      const navbarHeight = 85;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}
