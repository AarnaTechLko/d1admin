"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PlayerTable from "@/components/tables/PlayerTable";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  image: string;
  position: string;
  height: string;
  jersey: string;
  weight: string;
  history?: string;
  graduation: string;
  sport: string;
  status: string;
  earnings: number;
  age_group: string;
  grade_level: string;
  is_deleted: number;
}

const PlayersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [players, setplayers] = useState<Player[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchplayers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/player?search=${searchQuery}&page=${currentPage}&limit=10`
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
                console.log('response',data)

        setplayers(data.coaches);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchplayers();
  }, [searchQuery, currentPage]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Players" onSearch={setSearchQuery} />
      
      {loading && <p className="text-center py-5">Loading...</p>}
      {error && <p className="text-center py-5 text-red-500">{error}</p>}
      
      {!loading && !error && (
        <PlayerTable
          data={players}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default PlayersPage;
