'use client';

import { useState } from 'react';
import { submitContact } from '@/lib/api/contact';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isValid = form.name.length >= 2 && form.email.includes('@') && form.message.length >= 10;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await submitContact(form);
      if (res.status === 'success') {
        setSuccess(res.message);
        setForm({ name: '', email: '', message: '' });
      } else {
        setError(res.message);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 pt-16">
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-display font-semibold tracking-tight mb-4">Contact</h1>
            <p className="text-lg text-muted">Have a question, commission, or just want to say hello?</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="relative">
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="peer w-full rounded-lg border border-border-25 bg-surface py-3.5 px-4 pt-6 text-sm text-fg placeholder-transparent focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                autoComplete="name"
              />
              <label htmlFor="name" className="absolute left-4 top-2 text-xs text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted/50 peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent">
                Your name
              </label>
            </div>

            <div className="relative">
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="peer w-full rounded-lg border border-border-25 bg-surface py-3.5 px-4 pt-6 text-sm text-fg placeholder-transparent focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                autoComplete="email"
              />
              <label htmlFor="email" className="absolute left-4 top-2 text-xs text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted/50 peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent">
                Your email
              </label>
            </div>

            <div className="relative">
              <textarea
                id="message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Your message..."
                className="peer w-full rounded-lg border border-border-25 bg-surface py-3.5 px-4 pt-6 text-sm text-fg placeholder-transparent focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
              />
              <label htmlFor="message" className="absolute left-4 top-2 text-xs text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted/50 peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent">
                Your message
              </label>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                <p className="text-sm text-green-500">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full rounded-full bg-accent px-4 py-3 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
