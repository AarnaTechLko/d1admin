"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";
import { NEXT_PUBLIC_AWS_S3_BUCKET_LINK } from "@/lib/constants";

interface Badge {
  playerId: number;
  eval_average: number | string | null;
  first_name: string;
  last_name: string;
  firstName: string;
  lastName: string;
  image: string | null;
  id: string | null;
}

const TopEvaluationBadges: React.FC<{ badges: Badge[] }> = ({ badges }) => {
  if (!badges || badges.length === 0) return <p>No badges available.</p>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {badges.map((badge) => {
        const average = Number(badge.eval_average) || 0; // use API field
        return (
          <div
            key={badge.id}
            className="flex flex-col items-center border rounded-xl w-28 p-2 shadow-md bg-gray-100"
            title={`Badge ID ${badge.id} — Avg: ${average.toFixed(1)}`}
          >
            {/* Badge Frame */}
        <div className="relative w-24 h-24 rounded-full border-2 border-green-800 flex items-center justify-center">
  {/* Badge Background Image */}
  <Image
    src="/uploads/badge.png"
    alt="Verified Badge"
    width={96}
    height={96}
    className="object-contain rounded-full"
  />

  {/* Coach Image inside */}
  {badge.image && (
              <span className="absolute flex  left-[28px] -top-0.3  justify-center rounded-full">
      <Image
        src={`${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${badge.image}`}
        alt={`${badge.firstName} ${badge.lastName}`}
        width={40}
        height={40}
        className="object-cover rounded-full border-2 border-gray-200 shadow"
      />
    </span>
  )}
</div>


            {/* Coach Name + Average */}
            <span className="mt-2 text-xs font-semibold bg-green-800 text-white px-2 py-1 rounded-full shadow-sm text-center">
              {average.toFixed(1)} {badge.firstName ?? ""} {badge.lastName ?? ""}
            </span>
          </div>
        );
      })}
    </div>
  );
};


const PlayerBadgesPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const playerId = Number(params.id);

  const [badges, setBadges] = useState<Badge[]>([]);
  const [overallAverage, setOverallAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
const [playerName, setPlayerName] = useState<string>("");

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await fetch(`/api/player/${playerId}/badges`);
        const data = await res.json();
        console.log("all player data:", data);
        // if (res.ok) {
        //   setBadges(data.badges ?? []);
        //   setOverallAverage(data.overallAverage ?? null);
        // } 
        if (res.ok) {
          setBadges(data.evaluations ?? []);  // ✅ match API response
          setOverallAverage(data.overallAverage ?? null);
           if (data.evaluations?.length > 0) {
          const p = data.evaluations[0];
          setPlayerName(`${p.first_name} ${p.last_name}`);
        }
        }
        else {
          console.error(data.error);
        }
      } catch (err) {
        console.error("Failed to fetch badges:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(playerId)) fetchBadges();
  }, [playerId]);

  if (loading) return <p className="p-4">Loading badges...</p>;

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 text-blue-500"
      >
        <FaArrowLeft /> Back
      </button>

      <h1 className="text-2xl font-bold mb-2">Top Evaluation Badges</h1>
      <p className="mb-4">
        Player Name: {playerName || "N/A"} | Overall Average: {overallAverage ?? "N/A"}
      </p>

      {badges.length === 0 ? (
        <p>No badges found for this player.</p>
      ) : (
        <TopEvaluationBadges badges={badges} />
      )}
    </div>
  );
};

export default PlayerBadgesPage;
