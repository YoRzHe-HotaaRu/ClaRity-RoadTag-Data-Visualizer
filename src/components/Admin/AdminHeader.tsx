"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

interface AdminHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
    return (
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background-secondary)] backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/admin" className="text-xl font-bold gradient-text">
                        ClaRity Admin
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/admin"
                            className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/admin/locations"
                            className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                        >
                            Locations
                        </Link>
                        <Link
                            href="/"
                            className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                            target="_blank"
                        >
                            View Site ↗
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <span className="hidden sm:block text-sm text-[var(--foreground-muted)]">
                        {user.email}
                    </span>
                    <button
                        onClick={() => signOut({ callbackUrl: "/admin/login" })}
                        className="btn-secondary text-sm py-2"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
