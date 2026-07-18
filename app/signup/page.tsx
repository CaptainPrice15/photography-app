"use client";

import { useActionState } from "react";
import { registerAction, type AuthState } from "@/app/actions/auth";
import Link from "next/link";

export default function SignupPage() {
  const [state, dispatch, isPending] = useActionState(registerAction, {
    status: "idle",
    message: "",
  } as AuthState);

  return (
    <div className="mx-auto mt-12 max-w-md rounded-3xl border border-border bg-surface p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-muted">
        Sign up to download full-resolution images.
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
            autoComplete="email"
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
            autoComplete="new-password"
            minLength={8}
            className="mt-1 w-full rounded-xl border border-border bg-surface-65 px-4 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-accent focus:shadow-glow-sm"
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium">
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            className="mt-1 w-full rounded-xl border border-border bg-surface-65 px-4 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-accent focus:shadow-glow-sm"
            placeholder="Re-enter password"
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
          {isPending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-accent underline-draw transition-colors"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
