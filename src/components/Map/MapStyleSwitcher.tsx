"use client";

import { MapStyleKey } from "@/lib/constants";

interface MapStyleSwitcherProps {
    currentStyle: MapStyleKey;
    onStyleChange: (style: MapStyleKey) => void;
}

const styles: { key: MapStyleKey; label: string; icon: string }[] = [
    { key: "streets", label: "Streets", icon: "🗺️" },
    { key: "satellite", label: "Satellite", icon: "🛰️" },
    { key: "hybrid", label: "Hybrid", icon: "🌍" },
    { key: "outdoor", label: "Outdoor", icon: "🏔️" },
];

export default function MapStyleSwitcher({
    currentStyle,
    onStyleChange,
}: MapStyleSwitcherProps) {
    return (
        <div className="absolute top-4 left-4 glass-card p-1 flex gap-1">
            {styles.map((style) => (
                <button
                    key={style.key}
                    onClick={() => onStyleChange(style.key)}
                    className={`
            px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            flex items-center gap-1.5
            ${currentStyle === style.key
                            ? "bg-[var(--primary)] text-white"
                            : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)]"
                        }
          `}
                >
                    <span>{style.icon}</span>
                    <span className="hidden sm:inline">{style.label}</span>
                </button>
            ))}
        </div>
    );
}
