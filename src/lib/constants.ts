/**
 * Malaysian states and federal territories
 */
export const MALAYSIAN_STATES = [
    "Johor",
    "Kedah",
    "Kelantan",
    "Melaka",
    "Negeri Sembilan",
    "Pahang",
    "Penang",
    "Perak",
    "Perlis",
    "Sabah",
    "Sarawak",
    "Selangor",
    "Terengganu",
    "Kuala Lumpur",
    "Labuan",
    "Putrajaya",
] as const;

export type MalaysianState = (typeof MALAYSIAN_STATES)[number];

/**
 * Malaysia center coordinates (for initial map view)
 */
export const MALAYSIA_CENTER = {
    latitude: 4.2105,
    longitude: 101.9758,
    zoom: 6,
} as const;

/**
 * MapTiler style IDs for different map views
 */
export const MAP_STYLES = {
    streets: "streets-v2",
    satellite: "satellite",
    hybrid: "hybrid",
    outdoor: "outdoor-v2",
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;
