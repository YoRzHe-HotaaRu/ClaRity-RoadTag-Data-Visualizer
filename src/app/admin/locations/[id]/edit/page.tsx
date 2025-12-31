import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminHeader from "@/components/Admin/AdminHeader";
import LocationForm from "@/components/Admin/LocationForm";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getLocation(id: string) {
    return prisma.location.findUnique({
        where: { id },
        include: { images: true },
    });
}

export default async function EditLocationPage({ params }: PageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/admin/login");
    }

    const { id } = await params;
    const location = await getLocation(id);

    if (!location) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader user={session.user} />

            <main className="max-w-3xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold gradient-text">Edit Location</h1>
                    <p className="text-[var(--foreground-muted)] mt-1">
                        Modify location details and images
                    </p>
                </div>

                <LocationForm location={location} />
            </main>
        </div>
    );
}
