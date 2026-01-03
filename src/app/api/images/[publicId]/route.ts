import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to delete from Cloudinary
async function deleteFromCloudinary(publicId: string) {
    const decodedPublicId = decodeURIComponent(publicId);
    const result = await cloudinary.uploader.destroy(decodedPublicId);
    return result.result === "ok" || result.result === "not found";
}

// DELETE /api/images/[publicId] - Delete image from Cloudinary
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { publicId } = await params;
        const success = await deleteFromCloudinary(publicId);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: "Failed to delete image" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Failed to delete image:", error);
        return NextResponse.json(
            { error: "Failed to delete image" },
            { status: 500 }
        );
    }
}

// POST /api/images/[publicId] - Delete image (for sendBeacon on page unload)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));

        // Check if this is a delete request via sendBeacon
        if (body._method === "DELETE") {
            const { publicId } = await params;
            await deleteFromCloudinary(publicId);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    } catch (error) {
        console.error("Failed to process request:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
