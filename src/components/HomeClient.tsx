"use client";

import { useState } from "react";
import { Location, Image } from "@prisma/client";
import Sidebar from "@/components/Sidebar/Sidebar";
import MapContainer from "@/components/Map/MapContainer";

type LocationWithImage = Location & {
    images: Image[];
};

interface HomeClientProps {
    locations: LocationWithImage[];
}

export default function HomeClient({ locations }: HomeClientProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <main className="flex h-screen w-full overflow-hidden relative">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[var(--background-secondary)] border-b border-[var(--border)] px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 hover:bg-[var(--accent)] rounded transition-colors"
                    aria-label="Open menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h1 className="text-lg font-semibold">RoadTag Data Visualizer</h1>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-50"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <div
                className={`
                    md:hidden fixed left-0 top-0 bottom-0 z-50
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <Sidebar
                    locations={locations}
                    onClose={() => setIsSidebarOpen(false)}
                    isMobile={true}
                />
            </div>

            {/* Desktop Sidebar - Always visible on md+ */}
            <div className="hidden md:block flex-shrink-0">
                <Sidebar locations={locations} />
            </div>

            {/* Map - Full screen with padding for mobile header */}
            <div className="flex-1 relative pt-14 md:pt-0">
                <MapContainer locations={locations} />
            </div>
        </main>
    );
}
