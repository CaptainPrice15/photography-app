"use client";

import { cn } from "@/lib/utils";
import type { Collection } from "@/lib/storage/types";

interface Props {
  collections: Collection[];
  active: string;
  onChange: (slug: string) => void;
}

export function CollectionFilter({ collections, active, onChange }: Props) {
  const chips = [{ slug: "all", title: "All" }, ...collections];
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c.slug}
          type="button"
          onClick={() => onChange(c.slug)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            active === c.slug
              ? "border-accent bg-accent text-white"
              : "border-border bg-surface/60 text-muted hover:text-fg"
          )}
        >
          {c.title}
        </button>
      ))}
    </div>
  );
}
