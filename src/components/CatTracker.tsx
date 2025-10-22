"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";
import MapboxMap from "@/components/MapboxMap";

// Remove Leaflet in favor of Mapbox GL

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

// Mapbox is used; no Leaflet icon setup required

interface CatSighting {
  id: number;
  lat: number;
  lng: number;
  description: string;
  created_at: string;
}

interface NewSighting {
  lat: string;
  lng: string;
  description: string;
  cat_name: string;
  spottedAt?: string; // ISO string from datetime-local input
}

// No Leaflet hooks; clicks handled inside MapboxMap

export default function CatTracker() {
  const [catSightings, setCatSightings] = useState<CatSighting[]>([]);
  const [filteredSightings, setFilteredSightings] = useState<CatSighting[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSighting, setNewSighting] = useState<NewSighting>({ lat: "", lng: "", description: "", cat_name: "", spottedAt: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBorough] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Leaflet-specific icon setup removed

  // Fetch cat sightings from backend
  useEffect(() => {
    fetchSightings();
  }, []);

  // Filter sightings based on search query and borough
  useEffect(() => {
    let filtered = catSightings;
    
    if (searchQuery) {
      filtered = filtered.filter((sighting) =>
        sighting.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Note: Borough filtering would require borough data in the sightings
    // For now, this is a placeholder for future implementation
    
    setFilteredSightings(filtered);
  }, [searchQuery, selectedBorough, catSightings]);

  const fetchSightings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cats`);
      if (!response.ok) {
        throw new Error("Failed to fetch sightings");
      }
      const data = await response.json();
      setCatSightings(data);
      setFilteredSightings(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching sightings:", err);
      setError("Failed to load cat sightings. Make sure the backend is running.");
      // Use placeholder data if backend is not available
      const placeholderData = [
        { id: 1, lat: 40.7128, lng: -74.006, description: "Black cat near Central Park", created_at: new Date().toISOString() },
        { id: 2, lat: 40.73061, lng: -73.935242, description: "Orange tabby spotted on a rooftop", created_at: new Date().toISOString() },
      ];
      setCatSightings(placeholderData);
      setFilteredSightings(placeholderData);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setNewSighting({ lat: lat.toFixed(6), lng: lng.toFixed(6), description: "", cat_name: "", spottedAt: "" });
    setIsModalOpen(true);
  };

  const handleManualReport = () => {
    setNewSighting({ lat: "", lng: "", description: "", cat_name: "", spottedAt: "" });
    setIsModalOpen(true);
  };

  const handleSubmitSighting = async () => {
    if (!newSighting.lat || !newSighting.lng || !newSighting.description) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const payload = {
        lat: parseFloat(newSighting.lat),
        lng: parseFloat(newSighting.lng),
        description: newSighting.description || null,
        address: null as string | null,
        source: "map" as string | null,
        cat_name: newSighting.cat_name.trim() || null,
        image_url: null as string | null,
        spotted_at: newSighting.spottedAt || null,
      };

      console.log("Submitting sighting payload (CatTracker):", payload);
      const response = await fetch(`${API_BASE_URL}/api/cats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit sighting");
      }

      const data = await response.json();
      setCatSightings([data, ...catSightings]);
      setIsModalOpen(false);
      setNewSighting({ lat: "", lng: "", description: "", cat_name: "", spottedAt: "" });
    } catch (err) {
      console.error("Error submitting sighting:", err);
      alert("Failed to submit sighting. Please try again.");
    }
  };

  // Format date helper inlined where needed; keeping to satisfy linter

  // Mapbox map component handles display
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-8">
      {/* Centered NYC Map container */}
      <div className="w-full max-w-4xl aspect-[4/3] rounded-lg overflow-hidden shadow border mb-6">
        <MapboxMap sightings={filteredSightings} onMapClick={handleMapClick} />
      </div>

      {/* Controls Panel */}
      <div className="w-full max-w-4xl p-4">
        <p className="text-sm text-gray-600 mb-3">
          {filteredSightings.length} cat sighting{filteredSightings.length !== 1 ? 's' : ''} 
          {selectedBorough && ` in ${selectedBorough}`}
        </p>
        
        {error && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            {error}
          </div>
        )}

        {/* Search bar */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search descriptions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full flex items-center justify-center gap-2" 
            onClick={handleManualReport}
          >
            <MapPinIcon className="h-5 w-5" />
            Report a Sighting
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Or click anywhere on the map to add a sighting
          </p>
        </div>

        {/* Stats */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            💡 <strong>Tip:</strong> Click markers to see details. Zoom out to see clustered areas.
          </p>
        </div>
      </div>

      {/* Modal for reporting sightings */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Report Cat Sighting"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="40.7128"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newSighting.lat}
              onChange={(e) => setNewSighting({ ...newSighting, lat: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="-74.0060"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newSighting.lng}
              onChange={(e) => setNewSighting({ ...newSighting, lng: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Describe the cat (color, markings, behavior, etc.)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              value={newSighting.description}
              onChange={(e) => setNewSighting({ ...newSighting, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cat name (optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Miss Matcha"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newSighting.cat_name}
              onChange={(e) => {
                console.log("Cat name input changed to:", e.target.value);
                setNewSighting({ ...newSighting, cat_name: e.target.value });
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spotted at (optional)
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newSighting.spottedAt || ""}
              onChange={(e) => setNewSighting({ ...newSighting, spottedAt: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to use now.</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitSighting}
              className="flex-1"
            >
              Submit Sighting
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
