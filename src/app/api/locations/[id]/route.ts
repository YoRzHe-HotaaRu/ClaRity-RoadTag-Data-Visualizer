import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/locations/[id] - Fetch a single location
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const location = await prisma.location.findUnique({
            where: { id },
            include: {
                images: {
                    orderBy: { isPrimary: "desc" },
                },
            },
        });

        if (!location) {
            return NextResponse.json(
                { error: "Location not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(location);
    } catch (error) {
        console.error("Failed to fetch location:", error);
        return NextResponse.json(
            { error: "Failed to fetch location" },
            { status: 500 }
        );
    }
}

// PUT /api/locations/[id] - Update a location (protected)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const {
            name,
            latitude,
            longitude,
            elevation,
            imageryDate,
            state,
            description,
        } = body;

        const location = await prisma.location.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
                ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
                ...(elevation !== undefined && {
                    elevation: elevation ? parseFloat(elevation) : null,
                }),
                ...(imageryDate !== undefined && {
                    imageryDate: imageryDate ? new Date(imageryDate) : null,
                }),
                ...(state && { state }),
                ...(description !== undefined && { description: description || null }),
            },
            include: {
                images: true,
            },
        });

        return NextResponse.json(location);
    } catch (error) {
        console.error("Failed to update location:", error);
        return NextResponse.json(
            { error: "Failed to update location" },
            { status: 500 }
        );
    }
}

// DELETE /api/locations/[id] - Delete a location (protected)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await prisma.location.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete location:", error);
        return NextResponse.json(
            { error: "Failed to delete location" },
            { status: 500 }
        );
    }
}
