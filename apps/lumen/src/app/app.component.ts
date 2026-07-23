import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { NavbarComponent } from './shared/components/layout/navbar.component';
import { FooterComponent } from './shared/components/layout/footer.component';
import { AmbientBackgroundComponent } from './shared/components/theme/ambient-background.component';
import { CursorSpotlightComponent } from './shared/components/theme/cursor-spotlight.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    AmbientBackgroundComponent,
    CursorSpotlightComponent,
  ],
  template: `
    <app-ambient-background />
    <app-cursor-spotlight />
    <app-navbar />
    <router-outlet />
    <app-footer />
  `,
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);

  ngOnInit() {
    this.authService.init().subscribe();
  }
}