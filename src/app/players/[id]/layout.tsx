// app/players/[id]/layout.tsx
import type { ReactNode } from 'react';

export default function PlayerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation / header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Player Profile</h1>
          <nav className="space-x-4">
            <a
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </a>
            <a
              href="/players"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              All Players
            </a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar (profile photo, quick info) */}
          <aside className="lg:col-span-1">
            {/* Example skeleton for profile card */}
            <div className="rounded-2xl bg-white shadow p-4 sticky top-20">
              <div className="aspect-square w-full rounded-xl bg-gray-200 mb-4" />
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-gray-100 rounded" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
                <div className="h-4 w-2/3 bg-gray-100 rounded" />
              </div>
            </div>
          </aside>

          {/* Right content area */}
          <section className="lg:col-span-3">
            <div className="rounded-2xl bg-white shadow p-6">{children}</div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} HoopMania · All rights reserved.
        </div>
      </footer>
    </div>
  );
}
