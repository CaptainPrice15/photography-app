'use client';

import { useTheme } from '@/lib/theme-context';
import { useState, useEffect } from 'react';

export function AmbientBackground() {
  const { effectiveTheme } = useTheme();
  const [style, setStyle] = useState('');

  useEffect(() => {
    setStyle(
      effectiveTheme === 'dark'
        ? 'radial-gradient(ellipse 80% 50% at 50% -20%, rgb(var(--accent) / 0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgb(var(--accent-soft) / 0.1), transparent)'
        : 'radial-gradient(ellipse 80% 50% at 50% -20%, rgb(var(--accent) / 0.08), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgb(var(--accent-soft) / 0.05), transparent)'
    );
  }, [effectiveTheme]);

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ background: style }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-60 animate-mesh-drift-a" />
      <div className="absolute inset-0 opacity-50 animate-mesh-drift-b" />
    </div>
  );
}
