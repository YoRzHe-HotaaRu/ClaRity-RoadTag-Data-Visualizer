import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/Admin/AdminHeader";
import LocationForm from "@/components/Admin/LocationForm";

export default async function NewLocationPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/admin/login");
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader user={session.user} />

            <main className="max-w-3xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold gradient-text">Add New Location</h1>
                    <p className="text-[var(--foreground-muted)] mt-1">
                        Create a new tagged location on the map
                    </p>
                </div>

                <LocationForm />
            </main>
        </div>
    );
}
