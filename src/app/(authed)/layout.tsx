'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { ReactNode } from 'react';

export default function AuthedLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?returnTo=' + encodeURIComponent(window.location.pathname));
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <main className="flex-1 pt-16 flex items-center justify-center min-h-screen">
        <div className="h-10 w-10 animate-shimmer rounded-full border-2 border-accent/20 border-t-accent" />
      </main>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
