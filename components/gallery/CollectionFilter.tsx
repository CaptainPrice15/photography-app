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
    <div className="glass sticky top-[76px] z-30 flex flex-wrap gap-2 rounded-full border-border-40 p-2 shadow-card">
      {chips.map((c) => {
        const isActive = active === c.slug;
        return (
          <button
            key={c.slug}
            type="button"
            onClick={() => onChange(c.slug)}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200",
              isActive
                ? "bg-accent text-white shadow-glow-sm"
                : "text-muted hover:bg-surface-2 hover:text-fg"
            )}
          >
            {c.title}
          </button>
        );
      })}
    </div>
  );
}
