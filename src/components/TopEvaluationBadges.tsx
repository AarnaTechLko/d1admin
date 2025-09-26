"use client";

import { useEffect, useState } from "react";

interface Evaluation {
    id: number;
    eval_average: number;
}

interface BadgeData {
    playerId: number;
    avg: number | null;
    evaluations: Evaluation[];
}

export default function TopEvaluationBadges() {
    const [badges, setBadges] = useState<BadgeData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const res = await fetch("/api/evaluations/top-averages");
                if (!res.ok) throw new Error("Failed to fetch");
                const data: BadgeData[] = await res.json();
                setBadges(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBadges();
    }, []);

    if (loading) return <div>Loading badges…</div>;
    if (!badges.length) return <div>No badges found</div>;

    return (
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
            {badges.map((badge) => {
                const avgNum = badge.avg === null ? NaN : Number(badge.avg);
                const avgText = Number.isFinite(avgNum) ? avgNum.toFixed(1) : "—";

                return (
                
                    <div
                        key={badge.playerId}
                        className="flex flex-col items-center justify-center w-20 h-20 rounded-full overflow-hidden shadow-lg text-white font-bold"
                        title={`Player ${badge.playerId} — Avg: ${avgText}`}
                        style={{ background: "linear-gradient(to right, #6366f1, #a855f7)" }} // Optional inline gradient
                    >
                        <span className="text-xl">{avgText}</span>
                        <small className="text-xs">P {badge.playerId}</small>

                        {/* Show individual eval_average values */}
                        {/* <div className="mt-2 flex flex-wrap gap-1 justify-center">
                            {badge.evaluations.slice(0, 3).map((e) => (
                                <span
                                    key={e.id}
                                    className="px-1 py-0.5 text-[10px] bg-white/20 rounded"
                                >
                                    {e.eval_average.toFixed(1)}
                                </span>
                            ))}
                            {badge.evaluations.length > 3 && (
                                <span className="text-[10px]">+{badge.evaluations.length - 3}</span>
                            )}
                        </div> */}
                    </div>
                );
            })}
        </div>
    );
}
