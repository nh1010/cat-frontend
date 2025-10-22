"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import Map, { Source, Layer, MapRef } from "react-map-gl";

// Using generic GeoJSON types; no custom feature props needed here

export default function BoroughOutlineMap() {
  const [data, setData] = useState<GeoJSON.FeatureCollection | null>(null);
  const mapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    // Fetch NYC borough boundaries (small GeoJSON)
    // Public dataset; if it ever changes CORS policy we can move to a local file
    const url = "https://raw.githubusercontent.com/dwillis/nyc-maps/master/boroughs.geojson";
    fetch(url)
      .then(res => res.json())
      .then((fc: GeoJSON.FeatureCollection) => setData(fc))
      .catch(() => setData(null));
  }, []);

  // Fit bounds when data loads
  useEffect(() => {
    if (!data || !mapRef.current) return;
    const map = mapRef.current.getMap();
    const source = data;
    // Compute bounds from GeoJSON manually
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const extend = (lng: number, lat: number) => {
      if (lng < minX) minX = lng;
      if (lat < minY) minY = lat;
      if (lng > maxX) maxX = lng;
      if (lat > maxY) maxY = lat;
    };
    source.features.forEach((f) => {
      const geom = f.geometry as any;
      const coords = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
      coords.forEach((poly: any) => poly.forEach((ring: any) => ring.forEach((c: any) => extend(c[0], c[1]))));
    });
    if (isFinite(minX) && isFinite(minY) && isFinite(maxX) && isFinite(maxY)) {
      map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 20, duration: 0 });
    }
  }, [data]);

  return (
    <div className="w-full bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="w-full h-56 rounded-lg overflow-hidden">
          <Map
            ref={mapRef}
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
            initialViewState={{ longitude: -73.935242, latitude: 40.7128, zoom: 10 }}
            interactive={false}
            attributionControl={false}
            // blank style so only the blue boroughs render
            mapStyle={{
              version: 8,
              sources: {},
              layers: [
                {
                  id: "background",
                  type: "background",
                  paint: { "background-color": "#ffffff" }
                }
              ]
            }}
            style={{ height: "100%", width: "100%" }}
          >
            {data && (
              <Source id="boroughs" type="geojson" data={data as any}>
                <Layer id="borough-fill" type="fill" paint={{ "fill-color": "#1e40af", "fill-opacity": 0.9 }} />
                <Layer id="borough-line" type="line" paint={{ "line-color": "#ffffff", "line-width": 2 }} />
              </Source>
            )}
          </Map>
        </div>
      </div>
    </div>
  );
}


