import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    const clean = typeof window !== 'undefined'
      ? DOMPurify.sanitize(value, {
          ADD_TAGS: ['iframe'],
          ADD_ATTR: ['target', 'allow', 'allowfullscreen', 'frameborder', 'scrolling']
        })
      : value;
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }
}
