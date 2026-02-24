"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PlayerTable from "@/components/tables/PlayerTable";
import { Player } from "@/app/types/types";
import { useRoleGuard } from "@/hooks/useRoleGaurd";
import { useDebounce } from "@/hooks/useDebounce";

const PlayersPage = () => {
  useRoleGuard();

  const [searchQuery, setSearchQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch players from API
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/suspendplayer?search=${encodeURIComponent(
            debouncedSearch
          )}&page=${currentPage}&limit=10`
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setPlayers(data.player);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [debouncedSearch, currentPage]);

  return (
    <div>
      {/* Breadcrumb + Search */}
      <PageBreadcrumb pageTitle="Suspended Players" onSearch={setSearchQuery} />

      {/* Loading Spinner */}
      {loading && (
        <div className="flex items-center justify-center gap-4 py-5">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-center py-5 text-red-500">{error}</p>}

      {/* Player Table */}
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
