'use client';

import { useEffect } from 'react';

export function useCollectionTheme(accent?: string, accentSoft?: string) {
  useEffect(() => {
    if (!accent) return;

    const html = document.documentElement;
    const prevAccent = html.style.getPropertyValue('--accent');
    const prevAccentSoft = html.style.getPropertyValue('--accent-soft');

    html.style.setProperty('--accent', accent);
    if (accentSoft) {
      html.style.setProperty('--accent-soft', accentSoft);
    }

    return () => {
      if (prevAccent) {
        html.style.setProperty('--accent', prevAccent);
      } else {
        html.style.removeProperty('--accent');
      }
      if (prevAccentSoft) {
        html.style.setProperty('--accent-soft', prevAccentSoft);
      } else {
        html.style.removeProperty('--accent-soft');
      }
    };
  }, [accent, accentSoft]);
}
