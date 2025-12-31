import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/locations - Fetch all locations with optional search and filter
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const state = searchParams.get("state");

        const where: Record<string, unknown> = {};

        if (state) {
            where.state = state;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        const locations = await prisma.location.findMany({
            where,
            include: {
                images: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(locations);
    } catch (error) {
        console.error("Failed to fetch locations:", error);
        return NextResponse.json(
            { error: "Failed to fetch locations" },
            { status: 500 }
        );
    }
}

// POST /api/locations - Create a new location (protected)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            name,
            latitude,
            longitude,
            elevation,
            imageryDate,
            state,
            description,
            images,
        } = body;

        if (!name || latitude === undefined || longitude === undefined || !state) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const location = await prisma.location.create({
            data: {
                name,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                elevation: elevation ? parseFloat(elevation) : null,
                imageryDate: imageryDate ? new Date(imageryDate) : null,
                state,
                description: description || null,
                images: images?.length
                    ? {
                        create: images.map(
                            (
                                img: { publicId: string; url: string; isPrimary?: boolean },
                                index: number
                            ) => ({
                                publicId: img.publicId,
                                url: img.url,
                                isPrimary: index === 0 || img.isPrimary,
                            })
                        ),
                    }
                    : undefined,
            },
            include: {
                images: true,
            },
        });

        return NextResponse.json(location, { status: 201 });
    } catch (error) {
        console.error("Failed to create location:", error);
        return NextResponse.json(
            { error: "Failed to create location" },
            { status: 500 }
        );
    }
}
