import { Component, HostBinding, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Shared button/link component for the secondary "link button" pattern that was previously
 * duplicated as inline class strings across navbar, home, and checkout-success.
 * Supports `routerLink` (for internal links) or plain rendering; use `<app-button>` for a button,
 * or `<a app-button routerLink="...">` as an attribute on an anchor.
 */
@Component({
  selector: 'app-button, [app-button]',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (isAnchor()) {
      <a [routerLink]="routerLink" [class]="buttonClasses()" [attr.aria-disabled]="disabled">
        <ng-content></ng-content>
      </a>
    } @else {
      <button [type]="type" [class]="buttonClasses()" [disabled]="disabled" (click)="clicked.emit($event)">
        <ng-content></ng-content>
      </button>
    }
  `,
  styles: []
})
export class ButtonComponent {
  @HostBinding('class') class = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  /** Optional router link — when set, renders an `<a>` instead of a `<button>`. */
  @Input() routerLink?: string | string[];

  clicked = output<MouseEvent>();

  isAnchor(): boolean {
    return this.routerLink !== undefined && this.routerLink !== null;
  }

  buttonClasses(): string {
    const variants: Record<ButtonVariant, string> = {
      primary: 'border border-border bg-surface px-4 py-2 text-sm text-fg hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent hover:shadow-glow-sm',
      secondary: 'border border-border bg-transparent px-4 py-2 text-sm text-muted hover:bg-surface hover:text-fg hover:border-border-40',
      ghost: 'border-none bg-transparent px-4 py-2 text-sm text-muted hover:text-fg hover:bg-surface/50'
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    return `${variants[this.variant]} ${sizes[this.size]}`;
  }
}
