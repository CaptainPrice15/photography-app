"use client";

import { useEffect } from "react";
import { hexToRgbTriplet } from "@/lib/theme";

interface Props {
  accent: string;
  accentSoft?: string;
}

// Sets the global --accent / --accent-soft CSS variables to the active
// collection's palette. Because :root has a transition on those vars, the
// whole UI (buttons, blobs, rings) recolors smoothly. Resets on unmount.
export function CollectionThemeSetter({ accent, accentSoft }: Props) {
  useEffect(() => {
    const root = document.documentElement;
    const prevAccent = root.style.getPropertyValue("--accent");
    const prevSoft = root.style.getPropertyValue("--accent-soft");

    root.style.setProperty("--accent", hexToRgbTriplet(accent));
    if (accentSoft) {
      root.style.setProperty("--accent-soft", hexToRgbTriplet(accentSoft));
    }

    return () => {
      if (prevAccent) root.style.setProperty("--accent", prevAccent);
      if (prevSoft) root.style.setProperty("--accent-soft", prevSoft);
    };
  }, [accent, accentSoft]);

  return null;
}
