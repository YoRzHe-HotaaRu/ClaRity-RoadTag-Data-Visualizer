"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface AdminHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background-secondary)] backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-8">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-1"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <Link href="/admin" className="text-lg md:text-xl font-bold gradient-text">
                        ClaRity Admin
                    </Link>

                    {/* Desktop nav */}
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

                <div className="flex items-center gap-2 md:gap-4">
                    <span className="hidden sm:block text-xs md:text-sm text-[var(--foreground-muted)] truncate max-w-[150px]">
                        {user.email}
                    </span>
                    <button
                        onClick={() => signOut({ callbackUrl: "/admin/login" })}
                        className="btn-secondary text-xs md:text-sm py-1.5 md:py-2 px-3"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Mobile nav dropdown */}
            {isMenuOpen && (
                <nav className="md:hidden border-t border-[var(--border)] bg-[var(--background-secondary)]">
                    <Link
                        href="/admin"
                        className="block px-4 py-3 text-sm hover:bg-[var(--accent)] transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/locations"
                        className="block px-4 py-3 text-sm hover:bg-[var(--accent)] transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Locations
                    </Link>
                    <Link
                        href="/"
                        className="block px-4 py-3 text-sm hover:bg-[var(--accent)] transition-colors"
                        target="_blank"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        View Site ↗
                    </Link>
                </nav>
            )}
        </header>
    );
}
