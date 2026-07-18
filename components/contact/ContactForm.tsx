"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "@/app/actions/contact";
import { cn } from "@/lib/utils";

const initialState: ContactState = { status: "idle", message: "" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Your name"
          className="w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-fg outline-none transition-colors placeholder:text-muted focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-fg outline-none transition-colors placeholder:text-muted focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell me about your project or just say hi."
          className="w-full resize-none rounded-xl border border-border bg-surface/60 px-4 py-3 text-fg outline-none transition-colors placeholder:text-muted focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        )}
      >
        {pending ? "Sending…" : "Send message"}
      </button>

      {state.status !== "idle" && (
        <p
          role="status"
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            state.status === "success"
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-red-500/40 bg-red-500/10 text-red-500"
          )}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
