'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AmbientBackground } from '@/components/theme/ambient-background';
import { CursorSpotlight } from '@/components/theme/cursor-spotlight';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AmbientBackground />
        <CursorSpotlight />
        <Navbar />
        {children}
        <Footer />
      </AuthProvider>
    </ThemeProvider>
  );
}
