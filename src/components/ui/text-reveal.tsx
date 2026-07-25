'use client';

import { type ReactNode, useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  split?: boolean;
}

export function TextReveal({ children, className, delay = 0, split = false }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [visibleLines, setVisibleLines] = useState<boolean[]>([]);
  const linesRef = useRef<string[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (split) {
      const text = el.textContent || '';
      linesRef.current = text.split('\n').filter((l) => l.trim());
      setVisibleLines(linesRef.current.map(() => false));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
              if (split) {
                linesRef.current.forEach((_, i) => {
                  setTimeout(() => {
                    setVisibleLines((prev) => {
                      const next = [...prev];
                      next[i] = true;
                      return next;
                    });
                  }, i * 100);
                });
              }
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [split, delay]);

  if (split) {
    return (
      <div ref={ref} className={className}>
        {linesRef.current.map((line, i) => (
          <div key={i} className="overflow-hidden" style={{ transitionDelay: `${delay + i * 100}ms` }}>
            <span
              className={clsx(
                'inline-block transition-all duration-700 ease-out',
                visibleLines[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
              )}
            >
              {line}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <span
        className={clsx(
          'inline-block transition-all duration-700 ease-out',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        )}
      >
        {children}
      </span>
    </div>
  );
}
