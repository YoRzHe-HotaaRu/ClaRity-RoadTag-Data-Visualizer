"use client";

import { Location, Image } from "@prisma/client";
import { formatCoordinates } from "@/lib/coordinates";
import { CldImage } from "next-cloudinary";

type LocationWithImage = Location & {
    images: Image[];
};

interface LocationListProps {
    locations: LocationWithImage[];
    onLocationClick: (location: LocationWithImage) => void;
}

export default function LocationList({
    locations,
    onLocationClick,
}: LocationListProps) {
    if (locations.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-[var(--foreground-muted)] text-sm">
                <div className="text-center p-6">
                    <svg
                        className="w-12 h-12 mx-auto mb-3 opacity-30"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                    <p>No locations found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            {locations.map((location) => (
                <button
                    key={location.id}
                    onClick={() => onLocationClick(location)}
                    className="w-full p-4 flex gap-3 hover:bg-[var(--card-hover)] border-b border-[var(--border)] transition-colors text-left group"
                >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--background)] flex-shrink-0">
                        {location.images[0] ? (
                            <CldImage
                                src={location.images[0].publicId}
                                alt={location.name}
                                width={64}
                                height={64}
                                crop="fill"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--foreground-muted)]">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
                            {location.name}
                        </h3>
                        <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                            {location.state}
                        </p>
                        <p className="mono text-xs text-[var(--foreground-muted)] mt-1 truncate">
                            {formatCoordinates(location.latitude, location.longitude)}
                        </p>
                    </div>

                    {/* Arrow indicator */}
                    <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity text-[var(--primary)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>
            ))}
        </div>
    );
}
