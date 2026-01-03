"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                // Show welcome modal
                setShowWelcome(true);
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Redirect after showing welcome message
    useEffect(() => {
        if (showWelcome) {
            const timer = setTimeout(() => {
                router.push("/admin");
                router.refresh();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showWelcome, router]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        ClaRity Admin
                    </h1>
                    <p className="text-[var(--foreground-muted)]">
                        Sign in to manage locations
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 text-[var(--destructive)] text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-[var(--foreground-muted)] mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="admin@clarity.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-[var(--foreground-muted)] mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-[var(--foreground-muted)] mt-6">
                    <a href="/" className="hover:text-[var(--primary)] transition-colors">
                        ← Back to Map
                    </a>
                </p>
            </div>

            {/* Welcome Modal */}
            {showWelcome && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div
                        className="bg-[var(--card)] border border-[var(--border)] p-8 max-w-sm w-full mx-4 text-center animate-scaleIn"
                        style={{
                            animation: "scaleIn 0.3s ease-out forwards"
                        }}
                    >
                        {/* Success Icon */}
                        <div className="w-16 h-16 mx-auto mb-4 bg-[var(--primary)]/10 flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-[var(--primary)]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>

                        {/* Welcome Text */}
                        <h2 className="text-xl font-bold mb-2">Welcome Back!</h2>
                        <p className="text-[var(--muted-foreground)] text-sm mb-4">
                            Authentication successful. Redirecting to dashboard...
                        </p>

                        {/* Loading indicator */}
                        <div className="flex items-center justify-center gap-1">
                            <span className="w-2 h-2 bg-[var(--primary)] animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-[var(--primary)] animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-[var(--primary)] animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Keyframe styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { 
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out forwards;
                }
            `}</style>
        </main>
    );
}
