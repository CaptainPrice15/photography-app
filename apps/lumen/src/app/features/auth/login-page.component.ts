import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <main class="flex-1 pt-16 flex items-center justify-center min-h-screen px-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <h1 class="text-h2 font-semibold tracking-tight">Welcome back</h1>
          <p class="text-muted mt-2">Sign in to your account</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-muted mb-1">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="you@example.com"
              class="w-full rounded-lg border border-border bg-surface py-2.5 px-4 text-sm text-fg placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent"
              autocomplete="email"
              required
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-muted mb-1">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Your password"
              class="w-full rounded-lg border border-border bg-surface py-2.5 px-4 text-sm text-fg placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent"
              autocomplete="current-password"
              required
            />
          </div>

          @if (error()) {
            <div class="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <p class="text-sm text-red-500">{{ error() }}</p>
            </div>
          }

          <button
            type="submit"
            [disabled]="loading() || form.invalid"
            class="w-full rounded-full bg-accent px-4 py-3 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (loading()) {
              <span class="flex items-center justify-center gap-2">
                Signing in...
              </span>
            } @else {
              Sign in
            }
          </button>

          <p class="text-center text-sm text-muted">
            Don&apos;t have an account?
            <a routerLink="/signup" class="text-accent hover:underline">Sign up</a>
          </p>
        </form>
      </div>
    </main>
  `,
  styles: []
})
export class LoginPageComponent {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = this.authService.loading;
  error = this.authService.error;
  returnTo = signal('');

  constructor() {
    const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
    if (returnTo) {
      this.returnTo.set(returnTo);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.value;
    this.authService.login(email, password, this.returnTo() || '/gallery').subscribe();
  }
}