interface TagCountProps {
    total: number;
    filtered: number;
}

export default function TagCount({ total, filtered }: TagCountProps) {
    const isFiltered = filtered !== total;

    return (
        <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]">
            <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground-muted)]">
                    {isFiltered ? (
                        <>
                            Showing{" "}
                            <span className="text-[var(--primary)] font-medium">
                                {filtered}
                            </span>{" "}
                            of {total} tags
                        </>
                    ) : (
                        <>
                            <span className="text-[var(--primary)] font-medium">{total}</span>{" "}
                            {total === 1 ? "tag" : "tags"} total
                        </>
                    )}
                </span>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                    <span className="text-xs text-[var(--foreground-muted)]">Live</span>
                </div>
            </div>
        </div>
    );
}
