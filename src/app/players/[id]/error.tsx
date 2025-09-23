// app/player/[id]/error.tsx
'use client';

import Image from 'next/image';
import { useEffect } from 'react';

export default function PlayerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Player page error:', error);
  }, [error]);

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black">
      {/* Background Image */}
      <Image
        src="/bgr.jpg"
        alt="Basketball background"
        fill
        priority
        className="object-cover opacity-80"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 max-w-lg rounded-xl bg-black/40 p-8 text-center text-white backdrop-blur-md shadow-lg">
        <h1 className="mb-4 text-3xl font-bold text-orange-500">
          Oops! Something went wrong
        </h1>
        <p className="mb-6 text-lg leading-relaxed">
          We couldn’t load this player’s details right now.
          <br />
          Please try again or return later.
        </p>

        <button
          onClick={reset}
          className="rounded-xl bg-orange-500 px-6 py-3 text-lg font-semibold text-white transition hover:scale-105 hover:bg-orange-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
