"use client";

import MapboxMap from "@/components/MapboxMap";
import { useCallback, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";

export default function MapPage() {
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null);
  const [desc, setDesc] = useState("");
  const [catName, setCatName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [spottedDate, setSpottedDate] = useState<string>("");
  const [spottedTime, setSpottedTime] = useState<string>("");
  const [addr, setAddr] = useState("");

  console.log("Map page state - catName:", catName);

  const canSubmit = useMemo(() => !!pending && desc.trim().length > 0, [pending, desc]);

  const geocode = useCallback(async () => {
    if (!addr.trim()) return;
    const token = import.meta.env.VITE_MAPBOX_TOKEN ?? "";
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addr)}.json?access_token=${token}&limit=1&bbox=-74.25909,40.477399,-73.700272,40.917577`;
    const res = await fetch(url);
    const data = await res.json();
    const f = data.features?.[0];
    if (f?.center) {
      setFlyTo({ lng: f.center[0], lat: f.center[1] });
    }
  }, [addr]);

  const onMapClick = useCallback((lat: number, lng: number) => {
    setPending({ lat, lng });
  }, []);

  const submit = useCallback(async () => {
    if (!pending) return;
    let image_url: string | undefined = undefined;
    if (imageFile) {
      const form = new FormData();
      form.append("file", imageFile);
      const up = await fetch("http://localhost:5050/api/upload", { method: "POST", body: form });
      if (up.ok) {
        const j = await up.json();
        image_url = j.url;
      }
    }
    // Build spotted_at if provided (approximate time)
    let spotted_at: string | undefined = undefined;
    if (spottedDate) {
      const t = spottedTime || "12:00"; // default to noon if only date provided
      spotted_at = new Date(`${spottedDate}T${t}`).toISOString();
    }

    const body = {
      lat: pending.lat,
      lng: pending.lng,
      description: desc || null,
      address: addr || null,
      source: "map",
      cat_name: catName.trim() || null,
      image_url: image_url ?? null,
      spotted_at,
    };
    console.log("Submitting sighting payload:", body);
    console.log("State before submit - catName:", catName);

    await fetch("http://localhost:5050/api/cats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setPending(null);
    setDesc("");
    setCatName("");
    setImageFile(null);
    setSpottedDate("");
    setSpottedTime("");
  }, [pending, desc, addr, catName, imageFile, spottedDate, spottedTime]);

  return (
    <main className="bg-cream-100">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="sr-only">NYC Cat Map</h1>
        <div className="rounded-card border border-lilac-200 bg-cream-50 shadow-soft p-2">
          <div className="flex items-end gap-3 p-2">
            <div className="flex-1">
              <label className="block text-xs text-lilac-700 mb-1">Search address</label>
              <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="e.g., 350 5th Ave, New York" className="w-full rounded-md border border-lilac-300 px-3 py-2 bg-white text-lilac-900" />
            </div>
            <button onClick={geocode} className="rounded-md bg-lilac-800 text-cream-50 px-3 py-2 text-sm font-medium hover:bg-lilac-700">Search</button>
          </div>
          <div className="h-[calc(100vh-10rem)] w-full rounded-[14px] overflow-hidden relative">
            <div className="absolute inset-0">
              <MapboxMap sightings={[]} onMapClick={onMapClick} flyTo={flyTo} />
            </div>
          </div>
        </div>
      </section>

      <Modal isOpen={!!pending} onClose={() => setPending(null)} title="Report a sighting">
        <div className="space-y-3">
          <div className="text-sm text-lilac-700">Lat: {pending?.lat.toFixed(6)} Lng: {pending?.lng.toFixed(6)}</div>
          <label className="block text-xs text-lilac-700">Description</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full rounded-md border border-lilac-300 px-3 py-2 bg-white text-lilac-900" rows={3} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-lilac-700 mb-1">Cat name (optional)</label>
              <input 
                value={catName} 
                onChange={(e) => {
                  console.log("Cat name input changed to:", e.target.value);
                  setCatName(e.target.value);
                }} 
                className="w-full rounded-md border border-lilac-300 px-3 py-2 bg-white text-lilac-900" 
              />
            </div>
            <div>
              <label className="block text-xs text-lilac-700 mb-1">Photo (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="block w-full text-sm text-lilac-900 file:mr-3 file:rounded-md file:border-0 file:bg-lilac-100 file:px-3 file:py-1.5 file:text-lilac-900 hover:file:bg-lilac-200" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-lilac-700 mb-1">Date spotted (optional)</label>
              <input type="date" value={spottedDate} onChange={(e) => setSpottedDate(e.target.value)} className="w-full rounded-md border border-lilac-300 px-3 py-2 bg-white text-lilac-900" />
            </div>
            <div>
              <label className="block text-xs text-lilac-700 mb-1">Approx. time (optional)</label>
              <input type="time" step={60} value={spottedTime} onChange={(e) => setSpottedTime(e.target.value)} className="w-full rounded-md border border-lilac-300 px-3 py-2 bg-white text-lilac-900" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setPending(null)} className="rounded-md border border-lilac-300 text-lilac-900 px-3 py-2 text-sm hover:bg-lilac-50">Cancel</button>
            <button onClick={submit} disabled={!canSubmit} className="rounded-md bg-lilac-800 disabled:opacity-50 text-cream-50 px-3 py-2 text-sm font-medium hover:bg-lilac-700">Submit</button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
