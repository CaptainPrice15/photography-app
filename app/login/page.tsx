"use client";

import { useActionState } from "react";
import { loginAction, type AuthState } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, dispatch, isPending] = useActionState(loginAction, {
    status: "idle",
    message: "",
  } as AuthState);

  return (
    <div className="mx-auto mt-12 max-w-md rounded-3xl border border-border bg-surface p-8 shadow-sm">
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
            className="mt-1 w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
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
            className="mt-1 w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="••••••••"
          />
        </div>

        {state.status === "error" && (
          <p className="text-sm text-red-500">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {isPending ? "Signing in…" : "Continue"}
        </button>
      </form>

      <p className="mt-4 text-xs text-muted">
        Admin accounts bypass payment automatically.
      </p>
    </div>
  );
}
