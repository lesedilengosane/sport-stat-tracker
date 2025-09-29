// app/players/[id]/layout.tsx
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export default function PlayerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Background */}
      <Image
        src="/bgr.jpg" // hero-style basketball image in public/
        alt="Basketball hero background"
        fill
        priority
        className="object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-black/40" />{" "}
      {/* overlay for readability */}
      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-transparent backdrop-blur-sm mb-6 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <h1 className="text-2xl font-bold text-white">Player Profile</h1>
          <nav className="space-x-4">
            <Link
              href="/coach"
              className="text-white hover:text-orange-400 transition-colors"
            >
              Home
            </Link>
            {/* <Link
              href="/coach"
              className="text-white hover:text-orange-400 transition-colors"
            >
              All Players
            </Link> */}
          </nav>
        </header>

        {/* Main Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl bg-white/10 backdrop-blur-sm p-4 shadow space-y-4">
              <div className="aspect-square w-full rounded-xl bg-gray-300/20" />
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-gray-100/30 rounded" />
                <div className="h-4 w-1/2 bg-gray-100/30 rounded" />
                <div className="h-4 w-2/3 bg-gray-100/30 rounded" />
              </div>
            </div>
          </aside>

          {/* Right Content Area */}
          <section className="lg:col-span-3">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm shadow p-6">
              {children}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t border-white/20 text-center text-sm text-white/70 py-6">
          © {new Date().getFullYear()} HoopMania · All rights reserved.
        </footer>
      </div>
    </div>
  );
}
