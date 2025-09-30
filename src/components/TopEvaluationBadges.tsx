"use client";
import { useEffect, useState } from "react";
import Image from "next/image"; // ✅ Make sure to import from next/image
import { NEXT_PUBLIC_AWS_S3_BUCKET_LINK } from "@/lib/constants";
interface Evaluation {
  id: number;
  eval_average: number;
}
interface BadgeData {
  firstName: string;
  image: string | null;
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
     <div className="relative w-24 h-24 rounded-full border-2 border-green-800 flex items-center justify-center">
  {/* Badge Image (larger) */}
  <Image
    src="/uploads/badge.png"
    alt="Verified Badge"
    width={96} // larger width
    height={96} // larger height
    className="object-contain rounded-full"
  />

  {/* Player Image (smaller, with margin) */}
  <span className="absolute p-1 rounded-full bg-transparent">
    <Image
      src={`${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${badge.image}`}
      alt={`${badge.firstName} ${badge.lastName}`}
      width={54} // smaller width
      height={54} // smaller height
      className="object-cover rounded-full border-2 border-gray-200 shadow"
    />
  </span>
</div>

          {/* Player Name BELOW the circle */}
          <span className="mt-2 text-xs font-semibold  bg-green-800 text-white px-2 py-1 rounded-full shadow-sm text-center">
            {e.eval_average.toFixed(1)}  {badge.firstName} {badge.firstName}
          </span>

        </div>
      ))}
    </div>




  );
}

