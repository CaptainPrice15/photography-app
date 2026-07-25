'use client';

import { useRouter } from 'next/navigation';

interface BuyButtonProps {
  photoId: string;
  title?: string;
}

export function BuyButton({ photoId, title }: BuyButtonProps) {
  const router = useRouter();

  const navigate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/payment/checkout?photoId=${photoId}&title=${encodeURIComponent(title || 'Untitled')}`);
  };

  return (
    <button
      onClick={navigate}
      className="p-2 rounded-full bg-bg/80 backdrop-blur-sm text-muted transition-all duration-200 hover:scale-110 hover:bg-bg hover:text-fg focus:outline-none focus:ring-2 focus:ring-accent"
      aria-label={`Buy ${title || 'this photo'}`}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    </button>
  );
}
