import { Directive, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[appCollectionTheme]',
  standalone: true
})
export class CollectionThemeSetterDirective implements OnInit, OnDestroy {
  @Input() accent!: string;
  @Input() accentSoft?: string;
  
  private document = inject(DOCUMENT);
  private previousAccent = '';
  private previousAccentSoft = '';

  ngOnInit() {
    if (this.accent) {
      this.previousAccent = this.document.documentElement.style.getPropertyValue('--accent') || '';
      this.previousAccentSoft = this.document.documentElement.style.getPropertyValue('--accent-soft') || '';
      
      this.document.documentElement.style.setProperty('--accent', this.accent);
      if (this.accentSoft) {
        this.document.documentElement.style.setProperty('--accent-soft', this.accentSoft);
      }
    }
  }

  ngOnDestroy() {
    if (this.previousAccent) {
      this.document.documentElement.style.setProperty('--accent', this.previousAccent);
    } else {
      this.document.documentElement.style.removeProperty('--accent');
    }
    if (this.previousAccentSoft) {
      this.document.documentElement.style.setProperty('--accent-soft', this.previousAccentSoft);
    } else {
      this.document.documentElement.style.removeProperty('--accent-soft');
    }
  }
}