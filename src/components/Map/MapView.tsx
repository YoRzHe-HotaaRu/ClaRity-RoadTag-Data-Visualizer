"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { Location, Image } from "@prisma/client";
import { MALAYSIA_CENTER, MAP_STYLES, MapStyleKey } from "@/lib/constants";
import { formatCoordinates } from "@/lib/coordinates";
import MapStyleSwitcher from "./MapStyleSwitcher";
import Link from "next/link";

type LocationWithImage = Location & {
  images: Image[];
};

interface MapViewProps {
  locations: LocationWithImage[];
}

export default function MapView({ locations }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const markersRef = useRef<maptilersdk.Marker[]>([]);
  const [currentStyle, setCurrentStyle] = useState<MapStyleKey>("streets");
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "";

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [MALAYSIA_CENTER.longitude, MALAYSIA_CENTER.latitude],
      zoom: MALAYSIA_CENTER.zoom,
      attributionControl: false,
      navigationControl: false,
    });

    map.current.addControl(
      new maptilersdk.NavigationControl({ showCompass: true }),
      "top-right"
    );

    map.current.addControl(
      new maptilersdk.AttributionControl({ compact: true }),
      "bottom-right"
    );

    map.current.on("load", () => {
      setIsMapReady(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add markers when map is ready
  useEffect(() => {
    if (!isMapReady || !map.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for each location
    locations.forEach((location) => {
      const markerEl = document.createElement("div");
      markerEl.className = "map-marker";
      markerEl.style.cssText = `
                width: 28px;
                height: 28px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

      // Simple circular marker with Lucide-style pin icon
      markerEl.innerHTML = `
                <div style="
                    width: 28px;
                    height: 28px;
                    background: #ef4444;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                    border: 2px solid white;
                ">
                    <div style="
                        width: 8px;
                        height: 8px;
                        background: white;
                        border-radius: 50%;
                        transform: rotate(45deg);
                    "></div>
                </div>
            `;

      // Create popup content
      const popupContent = createPopupContent(location);

      const popup = new maptilersdk.Popup({
        offset: [0, -14],
        closeButton: true,
        maxWidth: "300px",
      }).setHTML(popupContent);

      const marker = new maptilersdk.Marker({
        element: markerEl,
        anchor: 'bottom'
      })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [isMapReady, locations]);

  // Listen for center map events from sidebar
  useEffect(() => {
    const handleCenterMap = (
      event: CustomEvent<{ latitude: number; longitude: number }>
    ) => {
      if (map.current) {
        map.current.flyTo({
          center: [event.detail.longitude, event.detail.latitude],
          zoom: 14,
          duration: 1500,
        });
      }
    };

    window.addEventListener("centerMap", handleCenterMap as EventListener);
    return () => {
      window.removeEventListener("centerMap", handleCenterMap as EventListener);
    };
  }, []);

  // Handle style change
  const handleStyleChange = useCallback((style: MapStyleKey) => {
    if (!map.current) return;

    setCurrentStyle(style);

    const styleMap: Record<MapStyleKey, maptilersdk.ReferenceMapStyle> = {
      streets: maptilersdk.MapStyle.STREETS,
      satellite: maptilersdk.MapStyle.SATELLITE,
      hybrid: maptilersdk.MapStyle.HYBRID,
      outdoor: maptilersdk.MapStyle.OUTDOOR,
    };

    map.current.setStyle(styleMap[style]);
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Style Switcher */}
      <MapStyleSwitcher
        currentStyle={currentStyle}
        onStyleChange={handleStyleChange}
      />
    </div>
  );
}

function createPopupContent(location: LocationWithImage): string {
  const primaryImage = location.images[0];
  const imageHtml = primaryImage
    ? `<img 
        src="https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_280,h_160/${primaryImage.publicId}" 
        alt="${location.name}"
        class="w-full h-40 object-cover"
      />`
    : `<div class="w-full h-40 bg-[var(--background)] flex items-center justify-center">
        <svg class="w-12 h-12 text-[var(--foreground-muted)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>`;

  return `
    <div class="popup-content">
      ${imageHtml}
      <div class="p-4">
        <h3 class="font-semibold text-base text-[var(--foreground)] mb-1">${location.name}</h3>
        <p class="text-xs text-[var(--foreground-muted)] mb-2">${location.state}</p>
        <div class="space-y-1.5 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-[var(--foreground-muted)]">📍</span>
            <span class="mono text-[var(--foreground-muted)]">${formatCoordinates(location.latitude, location.longitude)}</span>
          </div>
          ${location.elevation
      ? `<div class="flex items-center gap-2">
              <span class="text-[var(--foreground-muted)]">⛰️</span>
              <span class="text-[var(--foreground-muted)]">${location.elevation}m elevation</span>
            </div>`
      : ""
    }
        </div>
        <a 
          href="/location/${location.id}" 
          class="btn-primary mt-4 block text-center text-sm w-full"
          style="text-decoration: none;"
        >
          View Details
        </a>
      </div>
    </div>
  `;
}
