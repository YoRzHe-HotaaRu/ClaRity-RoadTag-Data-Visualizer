import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCoordinates, toDMS } from "@/lib/coordinates";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import ImageGallery from "@/components/ImageGallery";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getLocation(id: string) {
    const location = await prisma.location.findUnique({
        where: { id },
        include: {
            images: {
                orderBy: { isPrimary: "desc" },
            },
        },
    });

    return location;
}

export default async function LocationDetailPage({ params }: PageProps) {
    const { id } = await params;
    const location = await getLocation(id);

    if (!location) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[var(--background)]">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background-secondary)] backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        <span>Back to Map</span>
                    </Link>
                    <span className="text-sm text-[var(--foreground-muted)]">
                        {location.state}
                    </span>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Title Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        {location.name}
                    </h1>
                    {location.description && (
                        <p className="text-[var(--foreground-muted)] max-w-2xl">
                            {location.description}
                        </p>
                    )}
                </div>

                {/* Image Gallery */}
                <ImageGallery
                    images={location.images.map(img => ({
                        id: img.id,
                        publicId: img.publicId,
                        isPrimary: img.isPrimary
                    }))}
                    locationName={location.name}
                />

                {/* Location Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coordinates Card */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-4 uppercase tracking-wider">
                            Coordinates
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-xs text-[var(--foreground-muted)]">
                                    DMS Format
                                </span>
                                <p className="mono text-lg text-[var(--primary)]">
                                    {toDMS(location.latitude, location.longitude)}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs text-[var(--foreground-muted)]">
                                    Decimal Format
                                </span>
                                <p className="mono text-sm">
                                    {formatCoordinates(
                                        location.latitude,
                                        location.longitude,
                                        "decimal"
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-4 uppercase tracking-wider">
                            Information
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--foreground-muted)]">State</span>
                                <span className="font-medium">{location.state}</span>
                            </div>
                            {location.elevation !== null && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--foreground-muted)]">
                                        Elevation
                                    </span>
                                    <span className="font-medium">{location.elevation}m</span>
                                </div>
                            )}
                            {location.imageryDate && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--foreground-muted)]">
                                        Imagery Date
                                    </span>
                                    <span className="font-medium">
                                        {new Date(location.imageryDate).toLocaleDateString(
                                            "en-MY",
                                            {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }
                                        )}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--foreground-muted)]">Added</span>
                                <span className="font-medium">
                                    {new Date(location.createdAt).toLocaleDateString("en-MY", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Preview Placeholder */}
                <div className="mt-8 glass-card p-6">
                    <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-4 uppercase tracking-wider">
                        Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary inline-flex items-center gap-2"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                            Open in Google Maps
                        </a>
                        <CopyButton
                            text={`${location.latitude}, ${location.longitude}`}
                            label="Copy Coordinates"
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
