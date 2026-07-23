import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirm = control.get('confirm');
  return password && confirm && password.value !== confirm.value ? { mismatch: true } : null;
};

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <main class="flex-1 pt-16 flex items-center justify-center min-h-screen px-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <h1 class="text-h2 font-semibold tracking-tight">Create account</h1>
          <p class="text-muted mt-2">Join to save your favorites and purchase prints</p>
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
              placeholder="At least 8 characters"
              class="w-full rounded-lg border border-border bg-surface py-2.5 px-4 text-sm text-fg placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent"
              autocomplete="new-password"
              required
            />
          </div>

          <div>
            <label for="confirm" class="block text-sm font-medium text-muted mb-1">Confirm password</label>
            <input
              id="confirm"
              type="password"
              formControlName="confirm"
              placeholder="Repeat your password"
              class="w-full rounded-lg border border-border bg-surface py-2.5 px-4 text-sm text-fg placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent"
              autocomplete="new-password"
              required
            />
          </div>

          @if (form.errors?.['mismatch'] && form.get('confirm')?.touched) {
            <div class="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <p class="text-sm text-red-500">Passwords do not match</p>
            </div>
          }

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
              <span>Creating account...</span>
            } @else {
              Create account
            }
          </button>

          <p class="text-center text-sm text-muted">
            Already have an account?
            <a routerLink="/login" class="text-accent hover:underline">Sign in</a>
          </p>
        </form>
      </div>
    </main>
  `,
  styles: []
})
export class SignupPageComponent {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required]
  }, { validators: passwordMatchValidator });

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
    const { email, password, confirm } = this.form.value;
    this.authService.register(email, password, confirm, this.returnTo() || '/gallery').subscribe();
  }
}