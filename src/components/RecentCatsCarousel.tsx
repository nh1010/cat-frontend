"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

interface CatSighting {
  id: number;
  cat_name?: string;
  image_url: string;
  description: string;
  created_at: string;
}

export default function RecentCatsCarousel() {
  const [sightings, setSightings] = useState<CatSighting[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchRecentCats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cats/recent-with-images`);
        if (response.ok) {
          const data = await response.json();
          setSightings(data.slice(0, 3)); // Only show 3 most recent
        }
      } catch (error) {
        console.error("Failed to fetch recent cats:", error);
      }
    };
    fetchRecentCats();
  }, []);

  useEffect(() => {
    if (sightings.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sightings.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [sightings.length, isPaused]);

  if (sightings.length === 0) {
    return null;
  }

  const currentSighting = sightings[currentIndex];

  return (
    <div
      className="relative w-full h-64 rounded-card overflow-hidden shadow-soft"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Link to={`/sightings/${currentSighting.id}`}>
        <div className="relative w-full h-full">
          <img
            src={currentSighting.image_url}
            alt={currentSighting.cat_name || "Cat sighting"}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className="text-white font-semibold text-lg">
              {currentSighting.cat_name || "Unknown Cat"}
            </h3>
            <p className="text-white/90 text-sm line-clamp-2">
              {currentSighting.description}
            </p>
          </div>
        </div>
      </Link>
      
      {/* Carousel indicators */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        {sightings.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? "bg-white w-4" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

