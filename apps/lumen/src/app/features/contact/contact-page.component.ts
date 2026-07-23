import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <main class="flex-1 pt-16">
      <section class="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-12">
            <h1 class="text-display font-semibold tracking-tight mb-4">Contact</h1>
            <p class="text-lg text-muted">Have a question, commission, or just want to say hello?</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="relative">
              <input
                id="name"
                type="text"
                formControlName="name"
                placeholder="Your name"
                class="peer w-full rounded-lg border border-border-25 bg-surface py-3.5 px-4 pt-6 text-sm text-fg placeholder-transparent focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                autocomplete="name"
              />
              <label
                for="name"
                class="absolute left-4 top-2 text-xs text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted/50 peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent"
              >Your name</label>
            </div>

            <div class="relative">
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="you@example.com"
                class="peer w-full rounded-lg border border-border-25 bg-surface py-3.5 px-4 pt-6 text-sm text-fg placeholder-transparent focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                autocomplete="email"
              />
              <label
                for="email"
                class="absolute left-4 top-2 text-xs text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted/50 peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent"
              >Your email</label>
            </div>

            <div class="relative">
              <textarea
                id="message"
                formControlName="message"
                rows="5"
                placeholder="Your message..."
                class="peer w-full rounded-lg border border-border-25 bg-surface py-3.5 px-4 pt-6 text-sm text-fg placeholder-transparent focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
              ></textarea>
              <label
                for="message"
                class="absolute left-4 top-2 text-xs text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted/50 peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent"
              >Your message</label>
            </div>

            @if (error()) {
              <div class="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <p class="text-sm text-red-500">{{ error() }}</p>
              </div>
            }

            @if (success()) {
              <div class="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                <p class="text-sm text-green-500">{{ success() }}</p>
              </div>
            }

            <button
              type="submit"
              [disabled]="loading() || form.invalid"
              class="w-full rounded-full bg-accent px-4 py-3 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (loading()) {
                <span>Sending...</span>
              } @else {
                Send message
              }
            </button>
          </form>
        </div>
      </section>
    </main>
  `,
  styles: []
})
export class ContactPageComponent {
  private contactService = inject(ContactService);
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  loading = signal(false);
  error = signal('');
  success = signal('');

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.contactService.submitContact(this.form.value).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.success.set(res.message);
          this.form.reset();
        } else {
          this.error.set(res.message);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Something went wrong. Please try again.');
        this.loading.set(false);
      }
    });
  }
}