"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const MapboxMap = dynamic(() => import("@/components/MapboxMap"), { ssr: false });

export default function Home() {
  return (
    <main className="bg-cream-100 text-lilac-900 font-display selection:bg-lilac-200 selection:text-lilac-900">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight">
              <span className="block">EVERY CAT,</span>
              <span className="block">EVERY CORNER.</span>
            </h1>
            <p className="text-lg text-lilac-700 max-w-md">
              A data-driven passion project dedicated to helping every stray find safety, care, and love — giving a voice and a map to the cats that call New York home.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#map" className="inline-flex items-center gap-2 rounded-full bg-lilac-800 text-cream-50 px-5 py-2.5 text-sm font-semibold hover:bg-lilac-700">
                Browse sightings
              </Link>
            </div>
          </div>

          <div className="rounded-card border border-lilac-200 bg-cream-50 shadow-soft p-2">
            <div className="aspect-[4/3] w-full rounded-[14px] overflow-hidden relative">
              {/* Live NYC Map */}
              <div className="absolute inset-0">
                <MapboxMap sightings={[]} onMapClick={() => {}} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map anchor */}
      <section id="map" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-card border border-lilac-200 bg-white shadow-soft p-4">
          <p className="text-lilac-700 text-sm">Explore the live map above. More sections coming soon.</p>
        </div>
      </section>

      <footer className="border-t border-lilac-200 bg-cream-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-lilac-700">
          <p>© 2025 NYC Cat Tracker</p>
          <p>Built with 🐾 & Tailwind</p>
        </div>
      </footer>
    </main>
  );
}
