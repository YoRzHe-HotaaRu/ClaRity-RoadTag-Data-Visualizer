import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Use Node.js runtime to avoid Edge function size limits
export const runtime = "nodejs";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /admin routes except login
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        const session = await auth();

        if (!session?.user) {
            const loginUrl = new URL("/admin/login", request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
