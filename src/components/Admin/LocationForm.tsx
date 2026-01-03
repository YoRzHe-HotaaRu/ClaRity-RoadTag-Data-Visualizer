"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Location, Image } from "@prisma/client";
import { MALAYSIAN_STATES } from "@/lib/constants";
import { parseCoordinates, looksLikeCoordinates } from "@/lib/coordinates";
import { CldUploadWidget } from "next-cloudinary";

type LocationWithImages = Location & {
    images: Image[];
    roadLength?: number | null;
    roadWidth?: number | null;
};

interface LocationFormProps {
    location?: LocationWithImages;
}

interface UploadedImage {
    publicId: string;
    url: string;
    width?: number;
    height?: number;
}

export default function LocationForm({ location }: LocationFormProps) {
    const router = useRouter();
    const isEditing = !!location;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Form state
    const [name, setName] = useState(location?.name || "");
    const [coordsInput, setCoordsInput] = useState(
        location
            ? `${location.latitude}, ${location.longitude}`
            : ""
    );
    const [state, setState] = useState(location?.state || "");
    const [elevation, setElevation] = useState(
        location?.elevation?.toString() || ""
    );
    const [imageryDate, setImageryDate] = useState(
        location?.imageryDate
            ? new Date(location.imageryDate).toISOString().split("T")[0]
            : ""
    );
    const [description, setDescription] = useState(location?.description || "");
    const [roadLength, setRoadLength] = useState(
        location?.roadLength?.toString() || ""
    );
    const [roadWidth, setRoadWidth] = useState(
        location?.roadWidth?.toString() || ""
    );
    const [images, setImages] = useState<UploadedImage[]>(
        location?.images.map((img) => ({
            publicId: img.publicId,
            url: img.url,
            width: img.width || undefined,
            height: img.height || undefined,
        })) || []
    );

    // Track newly uploaded images (not from existing location)
    const newlyUploadedImages = useRef<string[]>([]);
    const formSubmitted = useRef(false);

    const handleUploadSuccess = (result: any) => {
        const info = result.info;
        const newImage = {
            publicId: info.public_id,
            url: info.secure_url,
            width: info.width,
            height: info.height,
        };
        setImages((prev) => [...prev, newImage]);
        // Track this as a newly uploaded image (for cleanup on cancel)
        if (!isEditing || !location?.images.find(img => img.publicId === info.public_id)) {
            newlyUploadedImages.current.push(info.public_id);
        }
    };

    // Cleanup function to delete all newly uploaded images
    const cleanupNewImages = async () => {
        if (formSubmitted.current) return; // Don't cleanup if form was submitted
        for (const publicId of newlyUploadedImages.current) {
            try {
                await fetch(`/api/images/${encodeURIComponent(publicId)}`, {
                    method: "DELETE",
                });
            } catch (error) {
                console.error("Failed to cleanup image:", error);
            }
        }
        newlyUploadedImages.current = [];
    };

    // Cleanup on page unload/refresh
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (newlyUploadedImages.current.length > 0 && !formSubmitted.current) {
                // Use sendBeacon for reliable cleanup on page unload
                for (const publicId of newlyUploadedImages.current) {
                    navigator.sendBeacon(
                        `/api/images/${encodeURIComponent(publicId)}`,
                        new Blob([JSON.stringify({ _method: 'DELETE' })], { type: 'application/json' })
                    );
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // Cleanup when component unmounts (navigating away via Next.js router)
            if (newlyUploadedImages.current.length > 0 && !formSubmitted.current) {
                // Use sendBeacon for reliable cleanup
                for (const publicId of newlyUploadedImages.current) {
                    navigator.sendBeacon(
                        `/api/images/${encodeURIComponent(publicId)}`,
                        new Blob([JSON.stringify({ _method: 'DELETE' })], { type: 'application/json' })
                    );
                }
            }
        };
    }, []);

    const removeImage = async (publicId: string) => {
        // Remove from local state immediately
        setImages((prev) => prev.filter((img) => img.publicId !== publicId));
        // Remove from tracking
        newlyUploadedImages.current = newlyUploadedImages.current.filter(id => id !== publicId);

        // Delete from Cloudinary in background
        try {
            await fetch(`/api/images/${encodeURIComponent(publicId)}`, {
                method: "DELETE",
            });
        } catch (error) {
            console.error("Failed to delete image from Cloudinary:", error);
        }
    };

    const handleCancel = async () => {
        await cleanupNewImages();
        router.back();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        // Parse coordinates
        let latitude: number;
        let longitude: number;

        if (looksLikeCoordinates(coordsInput)) {
            const coords = parseCoordinates(coordsInput);
            if (!coords) {
                setError("Invalid coordinates format");
                setIsSubmitting(false);
                return;
            }
            latitude = coords.latitude;
            longitude = coords.longitude;
        } else {
            // Try simple decimal parse
            const parts = coordsInput.split(",").map((s) => parseFloat(s.trim()));
            if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
                setError("Invalid coordinates format");
                setIsSubmitting(false);
                return;
            }
            latitude = parts[0];
            longitude = parts[1];
        }

        const payload = {
            name,
            latitude,
            longitude,
            state,
            elevation: elevation || null,
            roadLength: roadLength || null,
            roadWidth: roadWidth || null,
            imageryDate: imageryDate || null,
            description: description || null,
            images: isEditing ? undefined : images,
        };

        try {
            const url = isEditing
                ? `/api/locations/${location.id}`
                : "/api/locations";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save location");
            }

            router.push("/admin/locations");
            router.refresh();
            formSubmitted.current = true; // Mark as submitted so cleanup doesn't run
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/30 text-[var(--error)] text-sm">
                    {error}
                </div>
            )}

            <div className="glass-card p-6 space-y-6">
                {/* Basic Info */}
                <div>
                    <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-4 uppercase tracking-wider">
                        Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Location Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field"
                                placeholder="e.g., Petronas Twin Towers"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Coordinates *
                            </label>
                            <input
                                type="text"
                                value={coordsInput}
                                onChange={(e) => setCoordsInput(e.target.value)}
                                className="input-field mono"
                                placeholder="e.g., 4°39'1.34&quot;N 101°5'6.43&quot;E or 3.1578, 101.7117"
                                required
                            />
                            <p className="text-xs text-[var(--foreground-muted)] mt-1">
                                Supports DMS (4°39&apos;1.34&quot;N 101°5&apos;6.43&quot;E) or
                                decimal (3.1578, 101.7117) format
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">State *</label>
                            <select
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="select-field"
                                required
                            >
                                <option value="">Select state...</option>
                                {MALAYSIAN_STATES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Elevation (meters)
                            </label>
                            <input
                                type="number"
                                value={elevation}
                                onChange={(e) => setElevation(e.target.value)}
                                className="input-field"
                                placeholder="e.g., 45"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Road Length (meters)
                            </label>
                            <input
                                type="number"
                                value={roadLength}
                                onChange={(e) => setRoadLength(e.target.value)}
                                className="input-field"
                                placeholder="e.g., 500"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Road Width (meters)
                            </label>
                            <input
                                type="number"
                                value={roadWidth}
                                onChange={(e) => setRoadWidth(e.target.value)}
                                className="input-field"
                                placeholder="e.g., 10"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Imagery Date
                            </label>
                            <input
                                type="date"
                                value={imageryDate}
                                onChange={(e) => setImageryDate(e.target.value)}
                                className="input-field"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="input-field min-h-[100px]"
                                placeholder="Optional description of the location..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Images */}
            <div className="glass-card p-6">
                <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-4 uppercase tracking-wider">
                    Images
                </h3>

                {/* Uploaded Images */}
                {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {images.map((img, index) => (
                            <div key={img.publicId} className="relative group">
                                <img
                                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_200,h_150/${img.publicId}`}
                                    alt={`Uploaded ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg"
                                />
                                {index === 0 && (
                                    <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[var(--primary)] text-white text-xs rounded font-medium">
                                        Primary
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeImage(img.publicId)}
                                    className="absolute top-2 right-2 p-1 bg-[var(--error)] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Button */}
                <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    onSuccess={handleUploadSuccess}
                    options={{
                        multiple: true,
                        maxFiles: 10,
                        folder: "clarity-roadtag",
                    }}
                >
                    {({ open }) => (
                        <button
                            type="button"
                            onClick={() => open()}
                            className="w-full p-6 border-2 border-dashed border-[var(--border)] rounded-xl hover:border-[var(--primary)] transition-colors text-center"
                        >
                            <svg
                                className="w-8 h-8 mx-auto mb-2 text-[var(--foreground-muted)]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <p className="text-sm text-[var(--foreground-muted)]">
                                Click to upload images
                            </p>
                        </button>
                    )}
                </CldUploadWidget>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : isEditing ? (
                        "Update Location"
                    ) : (
                        "Create Location"
                    )}
                </button>
            </div>
        </form>
    );
}
