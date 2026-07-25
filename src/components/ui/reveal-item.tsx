'use client';

import { type ReactNode } from 'react';
import { useInView } from '@/hooks/use-in-view';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface RevealItemProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function RevealItem({ children, delay = 0, className }: RevealItemProps) {
  const { ref, isVisible } = useInView();

  return (
    <div
      ref={ref}
      className={twMerge(
        clsx(
          'transition-all duration-700 ease-out',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
          className
        )
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
