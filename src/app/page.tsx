import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

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

    return <HomeClient locations={locations} />;
}
