"use client";

import dynamic from "next/dynamic";
import { Location, Image } from "@prisma/client";

// Dynamic import to avoid SSR issues with MapTiler SDK
const MapView = dynamic(() => import("./MapView"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-[var(--background)]">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[var(--foreground-muted)] text-sm">Loading map...</p>
            </div>
        </div>
    ),
});

type LocationWithImage = Location & {
    images: Image[];
};

interface MapContainerProps {
    locations: LocationWithImage[];
}

export default function MapContainer({ locations }: MapContainerProps) {
    return <MapView locations={locations} />;
}
