"use client";
import { useEffect, useState } from "react";
import Image from "next/image"; // ✅ Make sure to import from next/image
interface Evaluation {
  id: number;
  eval_average: number;
}
interface BadgeData {
  firstName: string;
  lastName: string;
  playerId: number;
  avg: number | null;
  evaluations: Evaluation[];
}

interface Props {
  playerId: number;
}

export default function PlayerEvaluationBadges({ playerId }: Props) {
  const [badge, setBadge] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) return;

    const fetchPlayerEvaluations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/evaluations/top-averages/${playerId}`);
        if (!res.ok) throw new Error("Failed to fetch player evaluations");
        const data: BadgeData = await res.json();
        setBadge(data);
      } catch (err) {
        console.error(err);
        setBadge(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerEvaluations();
  }, [playerId]);

  if (loading) return <div>Loading evaluations…</div>;
  if (!badge) return <div>No evaluations found</div>;


  return (

    <div className="grid grid-cols-6 gap-4 ">
      {(badge.evaluations ?? []).map((e) => (
        <div
          key={e.id}
          className="flex flex-col items-center border-1 border-green-eee rounded-xl w-28 p-2  
           shadow-md bg-gray-100"
          title={`Evaluation ${e.id} — Avg: ${e.eval_average.toFixed(1)}`}
        >
          {/* Grey Circle wrapper */}
          <div
            className="relative w-15 h-15 rounded-full border-2 border-green-800 flex items-center justify-center"
          >
            {/* Badge Image */}
            <Image
              src="/uploads/badge.png"
              alt="Verified Badge"
              width={50}
              height={50}
              className="object-contain"
            />

            {/* Average value */}
            <span className="absolute text-xs font-bold text-white bg-black/50 px-1 py-0.5 rounded-full">
              {e.eval_average.toFixed(1)}
            </span>
          </div>

          {/* Player Name BELOW the circle */}
          <span className="mt-2 text-xs font-semibold  bg-green-800 text-white px-2 py-1 rounded-full shadow-sm text-center">
            {badge.firstName} {badge.lastName}
          </span>

        </div>
      ))}
    </div>




  );
}

