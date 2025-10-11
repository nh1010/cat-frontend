"use client";

import Map, { Marker, Popup, MapRef, MapLayerMouseEvent, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";

export interface MBFeature {
  id: number;
  lat: number;
  lng: number;
  description: string;
  reported_at: string;
}

interface Props {
  sightings: MBFeature[];
  onMapClick: (lat: number, lng: number) => void;
}

const NYC_BOUNDS: [number, number, number, number] = [-74.25909, 40.477399, -73.700272, 40.917577];

// Default mask: world with NYC bbox as a hole (used until borough shapes load)
const DEFAULT_MASK_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          // Outer ring (world-ish bbox) - counterclockwise
          [
            [-180, -85],
            [180, -85],
            [180, 85],
            [-180, 85],
            [-180, -85]
          ],
          // Inner ring (NYC bounds) - clockwise (hole)
          [
            [NYC_BOUNDS[0], NYC_BOUNDS[1]],
            [NYC_BOUNDS[0], NYC_BOUNDS[3]],
            [NYC_BOUNDS[2], NYC_BOUNDS[3]],
            [NYC_BOUNDS[2], NYC_BOUNDS[1]],
            [NYC_BOUNDS[0], NYC_BOUNDS[1]]
          ]
        ]
      }
    }
  ]
};

export default function MapboxMap({ sightings, onMapClick }: Props) {
  const mapRef = useRef<MapRef | null>(null);
  const [glSupported, setGlSupported] = useState<boolean | null>(null);
  const [popupId, setPopupId] = useState<number | null>(null);
  const [maskData, setMaskData] = useState<GeoJSON.FeatureCollection>(DEFAULT_MASK_GEOJSON);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  // Detect WebGL support and load mapbox-gl on client only
  useEffect(() => {
    let mounted = true;
    (async () => {
      type MapboxGLModule = typeof import("mapbox-gl") & {
        supported?: (options?: { failIfMajorPerformanceCaveat?: boolean }) => boolean;
      };
      const m: MapboxGLModule = await import("mapbox-gl");
      const ok = m.supported ? m.supported({ failIfMajorPerformanceCaveat: false }) : true;
      if (mounted) setGlSupported(!!ok);
    })();
    return () => { mounted = false; };
  }, []);

  // Load NYC borough polygons and build a world-with-holes mask
  useEffect(() => {
    // Stable NYC boroughs GeoJSON
    fetch("https://raw.githubusercontent.com/dwillis/nyc-maps/master/boroughs.geojson")
      .then((res) => res.json())
      .then((fc: GeoJSON.FeatureCollection) => {
        const holes: number[][][] = [];
        fc.features.forEach((f) => {
          const g = f.geometry as any;
          if (!g) return;
          if (g.type === "Polygon") {
            // Use the outer ring of each polygon as a hole
            if (g.coordinates && g.coordinates[0]) holes.push(g.coordinates[0]);
          } else if (g.type === "MultiPolygon") {
            g.coordinates.forEach((poly: number[][][]) => {
              if (poly && poly[0]) holes.push(poly[0]);
            });
          }
        });
        const mask: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [-180, -85],
                    [180, -85],
                    [180, 85],
                    [-180, 85],
                    [-180, -85]
                  ],
                  ...holes
                ]
              }
            }
          ]
        };
        setMaskData(mask);
      })
      .catch(() => {
        // keep default mask if remote fetch fails
      });
  }, []);

  const markers = useMemo(() => sightings.map((s) => (
    <Marker key={s.id} longitude={s.lng} latitude={s.lat} anchor="bottom">
      <div onClick={() => setPopupId(s.id)} className="h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow cursor-pointer" />
      {popupId === s.id && (
        <Popup longitude={s.lng} latitude={s.lat} onClose={() => setPopupId(null)} closeOnClick={false}>
          <div className="text-sm">
            <div className="font-semibold mb-1">{s.description}</div>
            <div className="text-xs text-gray-600">{new Date(s.reported_at).toLocaleString()}</div>
          </div>
        </Popup>
      )}
    </Marker>
  )), [sightings, popupId]);

  const handleClick = (e: MapLayerMouseEvent) => {
    const { lngLat } = e;
    onMapClick(lngLat.lat, lngLat.lng);
  };

  // Rely on maxBounds instead of manual onMove corrections to avoid recursion

  // Fallbacks for missing token or unsupported WebGL
  if (!token) {
    return <div className="w-full h-full flex items-center justify-center text-sm text-gray-600">Mapbox token missing. Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local and restart.</div>;
  }
  if (glSupported === false) {
    return <div className="w-full h-full flex items-center justify-center text-sm text-gray-600">WebGL is not available in this browser. Enable hardware acceleration and try again.</div>;
  }
  if (glSupported === null) {
    return <div className="w-full h-full" />; // allow layout while checking
  }

  type MapLib = Promise<typeof import("mapbox-gl")>;

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      // load the mapbox-gl library lazily to avoid bundler/SSR issues
      mapLib={import("mapbox-gl") as MapLib}
      initialViewState={{ longitude: -73.935242, latitude: 40.7128, zoom: 11 }}
      minZoom={10}
      maxZoom={18}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      // keep users within NYC
      maxBounds={[[-74.25909, 40.477399], [-73.700272, 40.917577]]}
      onLoad={() => {
        const m = mapRef.current?.getMap();
        if (m) m.fitBounds([[-74.25909, 40.477399], [-73.700272, 40.917577]], { padding: 20, duration: 0 });
      }}
      onClick={handleClick}
    >
      {/* Black-out mask outside NYC */}
      <Source id="nyc-mask" type="geojson" data={maskData}>
        <Layer id="nyc-mask-fill" type="fill" paint={{ "fill-color": "#000000", "fill-opacity": 0.6 }} />
      </Source>
      {/* Optional NYC outline */}
      <Layer id="nyc-outline" type="line" source="nyc-mask" paint={{ "line-color": "#a855f7", "line-width": 2 }} />
      {markers}
    </Map>
  );
}


