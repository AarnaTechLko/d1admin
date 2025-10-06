"use client";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import UnRankTable from "@/components/tables/UnRankTable";
import { Player } from "@/app/types/types";
interface Ranking {
  rankId: number;
  playerId: string;
  rank: number;
  firstName?: string;
  lastName?: string;
  image:string;
}
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RankingPage() {
  const { data: rankingData, isLoading } = useSWR("/api/ranking", fetcher);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/player");
        if (!res.ok) throw new Error("Failed to fetch players");
        const result = await res.json();
        setPlayers(result.player);
        // console.log("result",result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);
  if (isLoading || loading) return <div>Loading...</div>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Merge player info with ranking  
  const mergedData = rankingData?.data.map((rank: Ranking) => {
    const playerInfo = players.find((p) => p.id === rank.playerId);
    return { ...rank, ...playerInfo };
  });
// console.log("mergeDAta",mergedData);
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Ranking List</h2>
      <UnRankTable
        data={mergedData || []}
        currentPage={0}
        totalPages={0}
        setCurrentPage={() => {}}
      />
    </div>
  );
}
