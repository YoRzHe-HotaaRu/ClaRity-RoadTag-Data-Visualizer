"use client";

import { useState, useMemo } from "react";
import { Location, Image } from "@prisma/client";
import SearchBar from "./SearchBar";
import StateFilter from "./StateFilter";
import LocationList from "./LocationList";
import TagCount from "./TagCount";
import { looksLikeCoordinates, parseCoordinates } from "@/lib/coordinates";

type LocationWithImage = Location & {
    images: Image[];
};

interface SidebarProps {
    locations: LocationWithImage[];
    onClose?: () => void;
    isMobile?: boolean;
}

export default function Sidebar({ locations, onClose, isMobile }: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedState, setSelectedState] = useState<string>("");

    const filteredLocations = useMemo(() => {
        let filtered = locations;

        // Filter by state
        if (selectedState) {
            filtered = filtered.filter((loc) => loc.state === selectedState);
        }

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();

            // Check if searching by coordinates
            if (looksLikeCoordinates(searchQuery)) {
                const coords = parseCoordinates(searchQuery);
                if (coords) {
                    // Find locations near these coordinates (within ~0.01 degree ~1km)
                    filtered = filtered.filter((loc) => {
                        const latDiff = Math.abs(loc.latitude - coords.latitude);
                        const lonDiff = Math.abs(loc.longitude - coords.longitude);
                        return latDiff < 0.01 && lonDiff < 0.01;
                    });
                }
            } else {
                // Search by name
                filtered = filtered.filter((loc) =>
                    loc.name.toLowerCase().includes(query)
                );
            }
        }

        return filtered;
    }, [locations, searchQuery, selectedState]);

    const handleLocationClick = (location: LocationWithImage) => {
        // Dispatch custom event to center map
        const event = new CustomEvent("centerMap", {
            detail: { latitude: location.latitude, longitude: location.longitude },
        });
        window.dispatchEvent(event);
        // Close sidebar on mobile after selecting
        if (isMobile && onClose) {
            onClose();
        }
    };

    return (
        <aside className="w-[320px] md:w-[360px] h-full flex flex-col bg-[var(--background-secondary)] border-r border-[var(--border)]">
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-[var(--border)] flex items-center justify-between">
                <div>
                    <h1 className="text-lg md:text-xl font-semibold gradient-text">RoadTag Data Visualizer</h1>
                    <p className="text-xs md:text-sm text-[var(--foreground-muted)] mt-1">
                        Made by ClaRity
                    </p>
                </div>
                {/* Mobile close button */}
                {isMobile && onClose && (
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 hover:bg-[var(--accent)] rounded transition-colors"
                        aria-label="Close menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Search & Filter */}
            <div className="p-3 md:p-4 space-y-2 md:space-y-3 border-b border-[var(--border)]">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
                <StateFilter value={selectedState} onChange={setSelectedState} />
            </div>

            {/* Location List */}
            <div className="flex-1 overflow-hidden">
                <LocationList
                    locations={filteredLocations}
                    onLocationClick={handleLocationClick}
                />
            </div>

            {/* Tag Count */}
            <TagCount total={locations.length} filtered={filteredLocations.length} />
        </aside>
    );
}
