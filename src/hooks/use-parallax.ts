'use client';

import { useEffect, useRef, useState } from 'react';

export function useParallax(distance = 100) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('translateY(0px)');
  const ticking = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const updateTransform = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const viewCenter = vh / 2;
      const maxDist = vh / 2 + rect.height / 2;
      const progress = Math.max(-1, Math.min(1, (viewCenter - center) / maxDist));
      setTransform(`translateY(${progress * distance}px)`);
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        updateTransform();
        ticking.current = false;
      });
    };

    updateTransform();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [distance]);

  return { ref, style: { transform } };
}
