import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminHeader from "@/components/Admin/AdminHeader";
import LocationsTable from "@/components/Admin/LocationsTable";

async function getLocations() {
    return prisma.location.findMany({
        include: {
            images: { where: { isPrimary: true }, take: 1 },
            _count: { select: { images: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}

export default async function AdminLocationsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/admin/login");
    }

    const locations = await getLocations();

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader user={session.user} />

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold gradient-text">Locations</h1>
                        <p className="text-[var(--foreground-muted)] mt-1">
                            Manage all tagged locations
                        </p>
                    </div>
                    <Link href="/admin/locations/new" className="btn-primary">
                        + Add Location
                    </Link>
                </div>

                {/* Locations Table */}
                <LocationsTable locations={locations} />
            </main>
        </div>
    );
}
