"use client";

import dynamic from "next/dynamic";

const MapboxMap = dynamic(() => import("@/components/MapboxMap"), { ssr: false });

export default function MapPage() {
  return (
    <main className="bg-cream-100">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="sr-only">NYC Cat Map</h1>
        <div className="rounded-card border border-lilac-200 bg-cream-50 shadow-soft p-2">
          <div className="h-[calc(100vh-10rem)] w-full rounded-[14px] overflow-hidden relative">
            <div className="absolute inset-0">
              <MapboxMap sightings={[]} onMapClick={() => {}} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
