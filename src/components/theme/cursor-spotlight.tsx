'use client';

import { useTheme } from '@/lib/theme-context';
import { useState, useEffect, useRef } from 'react';

export function CursorSpotlight() {
  const { effectiveTheme } = useTheme();
  const [style, setStyle] = useState('none');
  const [isBrowser, setIsBrowser] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
    setIsBrowser(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (!isBrowser || reducedMotion) return;

    const color = effectiveTheme === 'dark' ? 'rgb(var(--accent) / 0.08)' : 'rgb(var(--accent) / 0.04)';
    setStyle(`radial-gradient(600px circle at ${mouseX.current}px ${mouseY.current}px, ${color}, transparent 70%)`);
  }, [effectiveTheme, isBrowser, reducedMotion]);

  useEffect(() => {
    if (!isBrowser || reducedMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const onMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
      const color = effectiveTheme === 'dark' ? 'rgb(var(--accent) / 0.08)' : 'rgb(var(--accent) / 0.04)';
      setStyle(`radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, ${color}, transparent 70%)`);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [effectiveTheme, isBrowser, reducedMotion]);

  if (!isBrowser || reducedMotion) return null;

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{ background: style }}
      aria-hidden="true"
    />
  );
}
