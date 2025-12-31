"use client";

import { useState } from "react";
import { Location, Image } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCoordinates } from "@/lib/coordinates";

type LocationWithImages = Location & {
    images: Image[];
    _count: { images: number };
};

interface LocationsTableProps {
    locations: LocationWithImages[];
}

export default function LocationsTable({ locations }: LocationsTableProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this location?")) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
            if (res.ok) {
                router.refresh();
            } else {
                alert("Failed to delete location");
            }
        } catch {
            alert("An error occurred");
        } finally {
            setDeletingId(null);
        }
    };

    if (locations.length === 0) {
        return (
            <div className="glass-card p-12 text-center">
                <svg
                    className="w-16 h-16 mx-auto mb-4 text-[var(--foreground-muted)] opacity-30"
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
                <h3 className="text-lg font-medium mb-2">No locations yet</h3>
                <p className="text-[var(--foreground-muted)] mb-4">
                    Get started by adding your first location
                </p>
                <Link href="/admin/locations/new" className="btn-primary">
                    + Add Location
                </Link>
            </div>
        );
    }

    return (
        <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                                State
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                                Coordinates
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                                Images
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                                Added
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {locations.map((location) => (
                            <tr
                                key={location.id}
                                className="hover:bg-[var(--card-hover)] transition-colors"
                            >
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--background)] overflow-hidden flex-shrink-0">
                                            {location.images[0] ? (
                                                <img
                                                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_40,h_40/${location.images[0].publicId}`}
                                                    alt={location.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[var(--foreground-muted)]">
                                                    <svg
                                                        className="w-4 h-4"
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
                                        <span className="font-medium">{location.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-[var(--foreground-muted)]">
                                    {location.state}
                                </td>
                                <td className="px-4 py-4 mono text-xs text-[var(--foreground-muted)]">
                                    {formatCoordinates(location.latitude, location.longitude)}
                                </td>
                                <td className="px-4 py-4 text-sm text-[var(--foreground-muted)]">
                                    {location._count.images}
                                </td>
                                <td className="px-4 py-4 text-sm text-[var(--foreground-muted)]">
                                    {new Date(location.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/location/${location.id}`}
                                            target="_blank"
                                            className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                                            title="View"
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
                                        </Link>
                                        <Link
                                            href={`/admin/locations/${location.id}/edit`}
                                            className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors text-[var(--foreground-muted)] hover:text-[var(--primary)]"
                                            title="Edit"
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
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(location.id)}
                                            disabled={deletingId === location.id}
                                            className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors text-[var(--foreground-muted)] hover:text-[var(--error)] disabled:opacity-50"
                                            title="Delete"
                                        >
                                            {deletingId === location.id ? (
                                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                                            ) : (
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
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
