"use client";
import React, { useEffect,useState } from "react";
import useSWR from "swr";
import UnRankTable from "@/components/tables/UnRankTable";
import { Player } from "@/app/types/types";

// import PageBreadcrumb from "@/components/common/PageBreadCrumb";
const fetcher = (url: string) => fetch(url).then(res => res.json());
export default function RankingPage() {
  const { data, isLoading } = useSWR("/api/ranking", fetcher);
  // const [searchQuery, setSearchQuery] = useState("");
  const [players, setplayers] = useState<Player[]>([]);
  // const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    
    const fetchplayers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/player`
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
                console.log('responsedaa',data)

        setplayers(data.player);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchplayers();
  }, [ ]);
//  if (loading) {
//         return <Loading />;
//     }
  if (isLoading) return <div>Loading...</div>;
  // if (error) return <div className="text-red-500">{(error as any).message}</div>;

  return (
    <div className="p-4">
        <input type="hidden" value={JSON.stringify(players)} />

        {loading && (
  <div className="flex items-center justify-center gap-4 ">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    Loading...
  </div>
)}    {error && <p className="text-center py-5 text-red-500">{error}</p>}
      <h2 className="text-lg font-bold mb-4">Ranking List</h2>
      <UnRankTable data={data?.data || []} currentPage={0} totalPages={0} setCurrentPage={function (): void {
        throw new Error("Function not implemented.");
      }} />

    </div>
  );
}
