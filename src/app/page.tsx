import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar/Sidebar";
import MapContainer from "@/components/Map/MapContainer";

export const dynamic = "force-dynamic";

async function getLocations() {
    try {
        const locations = await prisma.location.findMany({
            include: {
                images: {
                    where: { isPrimary: true },
                    take: 1,
                },
            },
            orderBy: { name: "asc" },
        });
        return locations;
    } catch {
        // Return empty array if database not yet connected
        return [];
    }
}

export default async function Home() {
    const locations = await getLocations();

    return (
        <main className="flex h-screen w-full overflow-hidden">
            {/* Left Sidebar */}
            <Sidebar locations={locations} />

            {/* Right Map */}
            <div className="flex-1 relative">
                <MapContainer locations={locations} />
            </div>
        </main>
    );
}
