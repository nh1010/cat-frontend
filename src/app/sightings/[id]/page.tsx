"use client";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

export default function SightingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [sighting, setSighting] = useState<CatSighting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSighting = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cats/${id}`);
        if (!response.ok) {
          throw new Error("Sighting not found");
        }
        const data = await response.json();
        setSighting(data);
      } catch (err: any) {
        setError(err.message || "Failed to load sighting");
      } finally {
        setLoading(false);
      }
    };
    fetchSighting();
  }, [id]);

  if (loading) {
    return (
      <main className="bg-cream-100 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-lilac-700">Loading...</div>
        </div>
      </main>
    );
  }

  if (error || !sighting) {
    return (
      <main className="bg-cream-100 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-lilac-900 mb-4">Sighting Not Found</h1>
            <p className="text-lilac-700 mb-6">{error}</p>
            <Link to="/map" className="inline-flex items-center gap-2 rounded-full bg-lilac-800 text-cream-50 px-5 py-2.5 text-sm font-semibold hover:bg-lilac-700">
              Back to Map
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-cream-100 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link to="/map" className="inline-flex items-center gap-2 text-lilac-800 hover:text-lilac-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Map
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {sighting.image_url && (
              <div className="rounded-card overflow-hidden shadow-soft">
                <img
                  src={sighting.image_url}
                  alt={sighting.cat_name || "Cat sighting"}
                  className="w-full h-auto"
                />
              </div>
            )}

            <div className="rounded-card border border-lilac-200 bg-white shadow-soft p-6 space-y-4">
              <h1 className="text-3xl font-bold text-lilac-900">
                {sighting.cat_name || "Unknown Cat"}
              </h1>

              <div>
                <h2 className="text-sm font-semibold text-lilac-700 mb-1">Description</h2>
                <p className="text-lilac-900">{sighting.description}</p>
              </div>

              {sighting.address && (
                <div>
                  <h2 className="text-sm font-semibold text-lilac-700 mb-1">Address</h2>
                  <p className="text-lilac-900">{sighting.address}</p>
                </div>
              )}

              <div>
                <h2 className="text-sm font-semibold text-lilac-700 mb-1">Location</h2>
                <p className="text-lilac-900">
                  {sighting.lat.toFixed(6)}, {sighting.lng.toFixed(6)}
                </p>
              </div>

              {sighting.spotted_at && (
                <div>
                  <h2 className="text-sm font-semibold text-lilac-700 mb-1">Spotted</h2>
                  <p className="text-lilac-900">
                    {new Date(sighting.spotted_at).toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <h2 className="text-sm font-semibold text-lilac-700 mb-1">Reported</h2>
                <p className="text-lilac-900">
                  {new Date(sighting.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-lilac-700 mb-1">Source</h2>
                <p className="text-lilac-900 capitalize">{sighting.source}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-card border border-lilac-200 bg-cream-50 shadow-soft p-2 sticky top-4">
              <div className="h-96 rounded-[14px] overflow-hidden">
                <MapboxMap
                  sightings={[{ id: sighting.id, lat: sighting.lat, lng: sighting.lng, description: sighting.description, created_at: sighting.created_at }]}
                  onMapClick={() => {}}
                  flyTo={{ lat: sighting.lat, lng: sighting.lng }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

