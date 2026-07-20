"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthState } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, dispatch, isPending] = useActionState(loginAction, {
    status: "idle",
    message: "",
  } as AuthState);

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl grid-cols-1 items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="hidden flex-col justify-between rounded-3xl border border-border-40 bg-gradient-to-br from-accent/15 via-surface to-surface-2 p-10 lg:flex">
        <span className="text-2xl font-semibold tracking-tight">Lumen</span>
        <div>
          <p className="text-3xl font-semibold leading-tight tracking-tight">
            Sign in to unlock full-resolution downloads.
          </p>
          <p className="mt-3 text-sm text-muted">
            Your library, your prints, your light.
          </p>
        </div>
        <span className="label">Members area</span>
      </div>

      <div className="glass-elevated rounded-3xl p-8 shadow-card">
        <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in to download full-resolution images.
        </p>

        <form action={dispatch} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-border bg-surface-65 px-4 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-accent focus:shadow-glow-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={4}
              className="mt-1 w-full rounded-xl border border-border bg-surface-65 px-4 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-accent focus:shadow-glow-sm"
              placeholder="••••••••"
            />
          </div>

          {state.status === "error" && (
            <p className="text-sm text-red-500">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow focus-glow active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? "Signing in…" : "Continue"}
          </button>
        </form>

        <p className="mt-4 text-xs text-muted">
          Admin accounts bypass payment automatically.
        </p>

        <p className="mt-4 text-center text-sm text-muted">
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-accent underline-draw transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
