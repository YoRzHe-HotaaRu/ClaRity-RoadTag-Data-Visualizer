/**
 * Coordinate parsing and formatting utilities
 * Supports DMS (Degrees Minutes Seconds) and decimal formats
 */

export interface Coordinates {
    latitude: number;
    longitude: number;
}

/**
 * Parse DMS format to decimal degrees
 * Example: 4°39'1.34"N 101°5'6.43"E -> { latitude: 4.6504, longitude: 101.0851 }
 */
export function parseDMS(dmsString: string): Coordinates | null {
    // Match patterns like: 4°39'1.34"N 101°5'6.43"E
    const pattern =
        /(\d+)°\s*(\d+)'?\s*(\d+\.?\d*)"?\s*([NS])\s+(\d+)°\s*(\d+)'?\s*(\d+\.?\d*)"?\s*([EW])/i;

    const match = dmsString.match(pattern);
    if (!match) return null;

    const [, latDeg, latMin, latSec, latDir, lonDeg, lonMin, lonSec, lonDir] =
        match;

    let latitude =
        parseFloat(latDeg) + parseFloat(latMin) / 60 + parseFloat(latSec) / 3600;
    let longitude =
        parseFloat(lonDeg) + parseFloat(lonMin) / 60 + parseFloat(lonSec) / 3600;

    if (latDir.toUpperCase() === "S") latitude = -latitude;
    if (lonDir.toUpperCase() === "W") longitude = -longitude;

    return { latitude, longitude };
}

/**
 * Parse decimal format
 * Example: "4.6504, 101.0851" -> { latitude: 4.6504, longitude: 101.0851 }
 */
export function parseDecimal(decimalString: string): Coordinates | null {
    const pattern = /(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/;
    const match = decimalString.match(pattern);
    if (!match) return null;

    const latitude = parseFloat(match[1]);
    const longitude = parseFloat(match[2]);

    if (isNaN(latitude) || isNaN(longitude)) return null;
    if (latitude < -90 || latitude > 90) return null;
    if (longitude < -180 || longitude > 180) return null;

    return { latitude, longitude };
}

/**
 * Parse coordinates from any supported format
 */
export function parseCoordinates(input: string): Coordinates | null {
    // Try DMS first
    const dms = parseDMS(input);
    if (dms) return dms;

    // Try decimal
    const decimal = parseDecimal(input);
    if (decimal) return decimal;

    return null;
}

/**
 * Convert decimal degrees to DMS string
 */
export function toDMS(latitude: number, longitude: number): string {
    const latDir = latitude >= 0 ? "N" : "S";
    const lonDir = longitude >= 0 ? "E" : "W";

    const formatDMS = (value: number): string => {
        const abs = Math.abs(value);
        const deg = Math.floor(abs);
        const minFloat = (abs - deg) * 60;
        const min = Math.floor(minFloat);
        const sec = ((minFloat - min) * 60).toFixed(2);
        return `${deg}°${min}'${sec}"`;
    };

    return `${formatDMS(latitude)}${latDir} ${formatDMS(longitude)}${lonDir}`;
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(
    latitude: number,
    longitude: number,
    format: "dms" | "decimal" = "dms"
): string {
    if (format === "dms") {
        return toDMS(latitude, longitude);
    }
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

/**
 * Validate if a string looks like it might be coordinates
 */
export function looksLikeCoordinates(input: string): boolean {
    // Check for DMS pattern
    if (/\d+°/.test(input)) return true;
    // Check for decimal pattern with comma
    if (/^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(input.trim())) return true;
    return false;
}
