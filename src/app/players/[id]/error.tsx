// app/players/error.tsx
'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <p className="text-red-600 font-semibold">Something went wrong 😢</p>
      <pre className="text-sm text-gray-700">{error.message}</pre>
      <button
        onClick={() => reset()}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}
