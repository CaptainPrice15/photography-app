import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CountUpComponent } from '../../shared/components/shared/count-up.component';
import { TextRevealComponent } from '../../shared/components/shared/text-reveal.component';
import { PhotoService } from '../../core/services/photo.service';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CountUpComponent, TextRevealComponent],
  template: `
    <main class="flex-1 pt-16">
      <section class="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <app-text-reveal [split]="true">
          <h1 class="text-display font-semibold tracking-tight mb-6">About</h1>
        </app-text-reveal>
        <app-text-reveal [split]="true">
          <p class="text-lg text-muted max-w-2xl leading-relaxed">
            Lumen is a photography portfolio showcasing curated collections, a responsive masonry gallery, 
            and the latest work. Light is the only subject.
          </p>
        </app-text-reveal>
      </section>

      <section class="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div class="grid gap-8 sm:grid-cols-3">
          <div class="text-center p-8 rounded-xl bg-surface block border-border-25">
            <app-count-up [value]="50" suffix="+" [duration]="2000" class="text-4xl font-bold font-display"></app-count-up>
            <p class="text-muted mt-2">Collections</p>
          </div>
          <div class="text-center p-8 rounded-xl bg-surface block border-border-25">
            <app-count-up [value]="500" suffix="+" [duration]="2000" class="text-4xl font-bold font-display"></app-count-up>
            <p class="text-muted mt-2">Photos</p>
          </div>
          <div class="text-center p-8 rounded-xl bg-surface block border-border-25">
            <app-count-up [value]="5" suffix="+" [duration]="2000" class="text-4xl font-bold font-display"></app-count-up>
            <p class="text-muted mt-2">Years</p>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div class="relative overflow-hidden rounded-xl bg-surface border border-border-25 p-8 sm:p-12">
          <div class="max-w-3xl">
            <app-text-reveal [split]="true">
              <h2 class="text-h2 font-semibold tracking-tight mb-6">The gear behind the lens</h2>
            </app-text-reveal>
            <app-text-reveal [split]="true">
              <ul class="space-y-3 text-muted">
                <li class="flex items-center gap-3">
                  <span class="h-1.5 w-1.5 rounded-full bg-accent shrink-0"></span>
                  Sony A7 III — Full-frame mirrorless
                </li>
                <li class="flex items-center gap-3">
                  <span class="h-1.5 w-1.5 rounded-full bg-accent shrink-0"></span>
                  Sony FE 24-105mm f/4 G OSS
                </li>
                <li class="flex items-center gap-3">
                  <span class="h-1.5 w-1.5 rounded-full bg-accent shrink-0"></span>
                  Sony FE 50mm f/1.8
                </li>
                <li class="flex items-center gap-3">
                  <span class="h-1.5 w-1.5 rounded-full bg-accent shrink-0"></span>
                  DJI Mini 4 Pro — Aerial photography
                </li>
              </ul>
            </app-text-reveal>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: []
})
export class AboutPageComponent implements OnInit {
  private photoService = inject(PhotoService);

  ngOnInit() {
    this.photoService.getCollection('bloom');
  }
}