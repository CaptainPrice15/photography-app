'use client';

import { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface ProtectedImageProps {
  children?: ReactNode;
  className?: string;
}

export function ProtectedContainer({ children, className }: ProtectedImageProps) {
  return (
    <div
      className={className}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{ userSelect: 'none', WebkitUserDrag: 'none' } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
