"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MapboxMap from "@/components/MapboxMap";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

interface CatSighting {
  id: number;
  lat: number;
  lng: number;
  cat_name?: string;
  description: string;
  address?: string;
  image_url?: string;
  spotted_at?: string;
  created_at: string;
  source: string;
}

export default function SightingsPage() {
  const [sightings, setSightings] = useState<CatSighting[]>([]);
  const [filteredSightings, setFilteredSightings] = useState<CatSighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // Filters
  const [searchText, setSearchText] = useState("");
  const [hasImageOnly, setHasImageOnly] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Refs for scrolling
  const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchSightings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cats`);
        if (response.ok) {
          const data = await response.json();
          setSightings(data);
          setFilteredSightings(data);
        }
      } catch (error) {
        console.error("Failed to fetch sightings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSightings();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...sightings];

    // Text search
    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.cat_name?.toLowerCase().includes(lower) ||
          s.description.toLowerCase().includes(lower)
      );
    }

    // Has image filter
    if (hasImageOnly) {
      filtered = filtered.filter((s) => s.image_url);
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((s) => new Date(s.spotted_at || s.created_at) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((s) => new Date(s.spotted_at || s.created_at) <= end);
    }

    setFilteredSightings(filtered);
  }, [searchText, hasImageOnly, startDate, endDate, sightings]);

  const handlePinClick = (id: number) => {
    setSelectedId(id);
    // Scroll to card
    const cardEl = cardRefs.current[id];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleCardClick = (id: number) => {
    setSelectedId(id);
  };

  if (loading) {
    return (
      <main className="bg-cream-100 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-lilac-700">Loading sightings...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-cream-100 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-lilac-900 mb-6">Browse Cat Sightings</h1>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="px-4 py-2 rounded-lg border border-lilac-200 focus:outline-none focus:ring-2 focus:ring-lilac-400"
          />
          <input
            type="date"
            placeholder="Start date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 rounded-lg border border-lilac-200 focus:outline-none focus:ring-2 focus:ring-lilac-400"
          />
          <input
            type="date"
            placeholder="End date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 rounded-lg border border-lilac-200 focus:outline-none focus:ring-2 focus:ring-lilac-400"
          />
          <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-lilac-200 bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={hasImageOnly}
              onChange={(e) => setHasImageOnly(e.target.checked)}
              className="accent-lilac-800"
            />
            <span className="text-sm text-lilac-900">Has image</span>
          </label>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Scrollable list */}
          <div className="lg:col-span-2 space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
            {filteredSightings.length === 0 && (
              <div className="text-center text-lilac-700 py-8">No sightings match your filters.</div>
            )}
            {filteredSightings.map((sighting) => (
              <div
                key={sighting.id}
                ref={(el) => (cardRefs.current[sighting.id] = el)}
                onClick={() => handleCardClick(sighting.id)}
                className={`rounded-card border bg-white shadow-soft p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedId === sighting.id ? "ring-2 ring-blush-500" : "border-lilac-200"
                }`}
              >
                <Link to={`/sightings/${sighting.id}`} className="block">
                  <div className="flex gap-4">
                    {sighting.image_url ? (
                      <img
                        src={sighting.image_url}
                        alt={sighting.cat_name || "Cat"}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-lilac-100 rounded-lg flex items-center justify-center text-3xl">
                        🐱
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lilac-900 mb-1">
                        {sighting.cat_name || "Unknown Cat"}
                      </h3>
                      <p className="text-sm text-lilac-700 line-clamp-2 mb-2">
                        {sighting.description}
                      </p>
                      <p className="text-xs text-lilac-600">
                        {new Date(sighting.spotted_at || sighting.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Right: Map */}
          <div className="lg:col-span-3">
            <div className="rounded-card border border-lilac-200 bg-cream-50 shadow-soft p-2 sticky top-4">
              <div className="h-[calc(100vh-16rem)] rounded-[14px] overflow-hidden">
                <MapboxMap
                  sightings={filteredSightings.map((s) => ({
                    id: s.id,
                    lat: s.lat,
                    lng: s.lng,
                    description: s.description,
                    created_at: s.created_at,
                  }))}
                  onMapClick={() => {}}
                  selectedId={selectedId}
                  onPinClick={handlePinClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

