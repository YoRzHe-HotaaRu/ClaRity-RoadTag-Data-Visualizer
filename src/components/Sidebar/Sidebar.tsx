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
}

export default function Sidebar({ locations }: SidebarProps) {
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
    };

    return (
        <aside className="w-[360px] h-full flex flex-col bg-[var(--background-secondary)] border-r border-[var(--border)]">
            {/* Header */}
            <div className="p-5 border-b border-[var(--border)]">
                <h1 className="text-xl font-semibold gradient-text">RoadTag Data Visualizer</h1>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">
                    Made by ClaRity
                </p>
            </div>

            {/* Search & Filter */}
            <div className="p-4 space-y-3 border-b border-[var(--border)]">
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
