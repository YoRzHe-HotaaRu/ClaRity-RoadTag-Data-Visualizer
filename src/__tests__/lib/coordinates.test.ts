import { describe, it, expect } from "vitest";
import {
    parseDMS,
    parseDecimal,
    parseCoordinates,
    toDMS,
    formatCoordinates,
    looksLikeCoordinates,
} from "@/lib/coordinates";

describe("Coordinate Parsing", () => {
    describe("parseDMS", () => {
        it("should parse standard DMS format", () => {
            const result = parseDMS("4°39'1.34\"N 101°5'6.43\"E");
            expect(result).not.toBeNull();
            expect(result!.latitude).toBeCloseTo(4.6504, 4);
            expect(result!.longitude).toBeCloseTo(101.0851, 4);
        });

        it("should parse DMS with South and West directions", () => {
            const result = parseDMS("10°30'30\"S 45°15'15\"W");
            expect(result).not.toBeNull();
            expect(result!.latitude).toBeLessThan(0);
            expect(result!.longitude).toBeLessThan(0);
        });

        it("should handle lowercase direction letters", () => {
            const result = parseDMS("4°39'1.34\"n 101°5'6.43\"e");
            expect(result).not.toBeNull();
        });

        it("should return null for invalid format", () => {
            expect(parseDMS("invalid")).toBeNull();
            expect(parseDMS("")).toBeNull();
        });
    });

    describe("parseDecimal", () => {
        it("should parse comma-separated decimal coordinates", () => {
            const result = parseDecimal("3.1578, 101.7117");
            expect(result).not.toBeNull();
            expect(result!.latitude).toBe(3.1578);
            expect(result!.longitude).toBe(101.7117);
        });

        it("should parse negative coordinates", () => {
            const result = parseDecimal("-33.8688, 151.2093");
            expect(result).not.toBeNull();
            expect(result!.latitude).toBeLessThan(0);
            expect(result!.longitude).toBeGreaterThan(0);
        });

        it("should reject out-of-range latitude", () => {
            expect(parseDecimal("91, 100")).toBeNull();
            expect(parseDecimal("-91, 100")).toBeNull();
        });

        it("should reject out-of-range longitude", () => {
            expect(parseDecimal("0, 181")).toBeNull();
            expect(parseDecimal("0, -181")).toBeNull();
        });
    });

    describe("parseCoordinates", () => {
        it("should auto-detect DMS format", () => {
            const result = parseCoordinates("4°39'1.34\"N 101°5'6.43\"E");
            expect(result).not.toBeNull();
        });

        it("should auto-detect decimal format", () => {
            const result = parseCoordinates("3.1578, 101.7117");
            expect(result).not.toBeNull();
        });

        it("should return null for unrecognized format", () => {
            expect(parseCoordinates("not coordinates")).toBeNull();
        });
    });

    describe("toDMS", () => {
        it("should convert positive coordinates to DMS", () => {
            const result = toDMS(4.6504, 101.0851);
            expect(result).toContain("N");
            expect(result).toContain("E");
            expect(result).toContain("°");
        });

        it("should convert negative coordinates with S and W", () => {
            const result = toDMS(-33.8688, -151.2093);
            expect(result).toContain("S");
            expect(result).toContain("W");
        });
    });

    describe("formatCoordinates", () => {
        it("should format as DMS by default", () => {
            const result = formatCoordinates(4.6504, 101.0851);
            expect(result).toContain("°");
        });

        it("should format as decimal when specified", () => {
            const result = formatCoordinates(4.6504, 101.0851, "decimal");
            expect(result).not.toContain("°");
            expect(result).toContain(",");
        });
    });

    describe("looksLikeCoordinates", () => {
        it("should detect DMS patterns", () => {
            expect(looksLikeCoordinates("4°39'1.34\"N")).toBe(true);
        });

        it("should detect decimal patterns", () => {
            expect(looksLikeCoordinates("3.1578, 101.7117")).toBe(true);
        });

        it("should return false for regular text", () => {
            expect(looksLikeCoordinates("hello world")).toBe(false);
            expect(looksLikeCoordinates("Kuala Lumpur")).toBe(false);
        });
    });
});
