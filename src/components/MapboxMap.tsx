"use client";

import Map, { Marker, Popup, MapRef, MapLayerMouseEvent, Source, Layer, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";

export interface MBFeature {
  id: number;
  lat: number;
  lng: number;
  description: string;
  created_at: string; // from backend
}

interface Props {
  sightings: MBFeature[];
  onMapClick: (lat: number, lng: number) => void;
  flyTo?: { lat: number; lng: number } | null;
  selectedId?: number | null;
  onPinClick?: (id: number) => void;
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

export default function MapboxMap({ sightings, onMapClick, flyTo, selectedId, onPinClick }: Props) {
  const mapRef = useRef<MapRef | null>(null);
  const [glSupported, setGlSupported] = useState<boolean | null>(null);
  const [popupId, setPopupId] = useState<number | null>(null);
  const [maskData, setMaskData] = useState<GeoJSON.FeatureCollection>(DEFAULT_MASK_GEOJSON);
  const [zoom, setZoom] = useState(11);

  const token = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

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

  // Scale pins based on zoom level (zoom 8-18)
  const pinSize = useMemo(() => {
    const minZoom = 8;
    const maxZoom = 18;
    const minSize = 1.5; // rem at min zoom
    const maxSize = 3.5; // rem at max zoom
    const normalized = (zoom - minZoom) / (maxZoom - minZoom);
    return minSize + (normalized * (maxSize - minSize));
  }, [zoom]);

  const markers = useMemo(() => sightings.map((s) => {
      const isSelected = selectedId === s.id;
      return (
        <Marker key={s.id} longitude={s.lng} latitude={s.lat} anchor="bottom">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onPinClick) {
                onPinClick(s.id);
              } else {
                setPopupId(s.id);
              }
            }}
            className={`hover:scale-110 transition-transform cursor-pointer focus:outline-none ${isSelected ? 'scale-125' : ''}`}
            aria-label={s.description || "Cat sighting"}
            style={{ width: `${pinSize * 16}px`, height: `${pinSize * 20}px` }}
          >
            <svg
              viewBox="0 0 24 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              {/* Pin shape */}
              <path
                d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 20 12 20s12-11.5 12-20c0-6.627-5.373-12-12-12z"
                fill={isSelected ? "#ec4899" : "#a78bfa"}
              />
              <circle cx="12" cy="12" r="10" fill="#faf5ff" />
              
              {/* Paw print image */}
              <image
                href="/paw.png"
                x="3"
                y="3"
                width="18"
                height="18"
                preserveAspectRatio="xMidYMid meet"
              />
            </svg>
          </button>
          {popupId === s.id && !onPinClick && (
            <Popup longitude={s.lng} latitude={s.lat} onClose={() => setPopupId(null)} closeOnClick={false}>
              <div className="text-sm">
                <div className="font-semibold mb-1">{s.description}</div>
                <div className="text-xs text-gray-600">{new Date(s.created_at).toLocaleString()}</div>
              </div>
            </Popup>
          )}
        </Marker>
      );
    }), [sightings, popupId, pinSize, selectedId, onPinClick]);

  // Respond to flyTo prop changes
  useEffect(() => {
    if (!flyTo) return;
    const m = mapRef.current?.getMap();
    if (!m) return;
    m.flyTo({ center: [flyTo.lng, flyTo.lat], zoom: Math.max(m.getZoom(), 15), essential: true });
  }, [flyTo]);

  const handleClick = (e: MapLayerMouseEvent) => {
    const { lngLat } = e;
    onMapClick(lngLat.lat, lngLat.lng);
  };

  // Fallbacks for missing token or unsupported WebGL
  if (!token) {
    return <div className="w-full h-full flex items-center justify-center text-sm text-gray-600">Mapbox token missing. Add VITE_MAPBOX_TOKEN to .env and restart.</div>;
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
      minZoom={8}
      maxZoom={18}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      // keep users within NYC
      maxBounds={[[-74.25909, 40.477399], [-73.700272, 40.917577]]}
      onLoad={() => {
        const m = mapRef.current?.getMap();
        if (m) {
          m.fitBounds([[-74.25909, 40.477399], [-73.700272, 40.917577]], { padding: 20, duration: 0 });
          setZoom(m.getZoom());
        }
      }}
      onZoom={(e) => setZoom(e.viewState.zoom)}
      onClick={handleClick}
    >
      {/* Black-out mask outside NYC */}
      <Source id="nyc-mask" type="geojson" data={maskData}>
        <Layer id="nyc-mask-fill" type="fill" paint={{ "fill-color": "#000000", "fill-opacity": 0.6 }} />
      </Source>
      {/* Optional NYC outline */}
      <Layer id="nyc-outline" type="line" source="nyc-mask" paint={{ "line-color": "#a855f7", "line-width": 2 }} />

      {/* Built-in navigation control (zoom) */}
      <NavigationControl position="top-right" showCompass={false} />

      {markers}
    </Map>
  );
}


