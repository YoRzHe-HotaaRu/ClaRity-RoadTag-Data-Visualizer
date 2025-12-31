import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminHeader from "@/components/Admin/AdminHeader";

async function getStats() {
    const [locationCount, imageCount] = await Promise.all([
        prisma.location.count(),
        prisma.image.count(),
    ]);

    const recentLocations = await prisma.location.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
            images: { where: { isPrimary: true }, take: 1 },
        },
    });

    return { locationCount, imageCount, recentLocations };
}

export default async function AdminDashboard() {
    const session = await auth();

    if (!session?.user) {
        redirect("/admin/login");
    }

    const { locationCount, imageCount, recentLocations } = await getStats();

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader user={session.user} />

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
                    <p className="text-[var(--foreground-muted)] mt-1">
                        Welcome back, {session.user.name || session.user.email}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[var(--foreground-muted)]">
                                    Total Locations
                                </p>
                                <p className="text-3xl font-bold text-[var(--primary)] mt-1">
                                    {locationCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-[var(--primary)]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[var(--foreground-muted)]">
                                    Total Images
                                </p>
                                <p className="text-3xl font-bold text-[var(--accent)] mt-1">
                                    {imageCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-[var(--accent)]"
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
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[var(--foreground-muted)]">
                                    Quick Action
                                </p>
                                <Link
                                    href="/admin/locations/new"
                                    className="btn-primary mt-3 inline-block text-sm"
                                >
                                    + Add Location
                                </Link>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-[var(--success)]/10 flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-[var(--success)]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Locations */}
                <div className="glass-card">
                    <div className="p-6 border-b border-[var(--border)]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Recent Locations</h2>
                            <Link
                                href="/admin/locations"
                                className="text-sm text-[var(--primary)] hover:underline"
                            >
                                View All →
                            </Link>
                        </div>
                    </div>

                    {recentLocations.length > 0 ? (
                        <ul className="divide-y divide-[var(--border)]">
                            {recentLocations.map((location) => (
                                <li key={location.id}>
                                    <Link
                                        href={`/admin/locations/${location.id}/edit`}
                                        className="flex items-center gap-4 p-4 hover:bg-[var(--card-hover)] transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-[var(--background)] overflow-hidden flex-shrink-0">
                                            {location.images[0] ? (
                                                <img
                                                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_48,h_48/${location.images[0].publicId}`}
                                                    alt={location.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[var(--foreground-muted)]">
                                                    <svg
                                                        className="w-5 h-5"
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
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate">{location.name}</h3>
                                            <p className="text-sm text-[var(--foreground-muted)]">
                                                {location.state}
                                            </p>
                                        </div>
                                        <span className="text-sm text-[var(--foreground-muted)]">
                                            {new Date(location.createdAt).toLocaleDateString()}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-8 text-center text-[var(--foreground-muted)]">
                            <p>No locations yet.</p>
                            <Link
                                href="/admin/locations/new"
                                className="text-[var(--primary)] hover:underline mt-2 inline-block"
                            >
                                Add your first location
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
