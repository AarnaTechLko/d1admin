"use client";
// import { Evaluation } from "@/app/types/types";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import IncompletePlayerTable from "@/components/tables/IncompletePlayerTable";

import { inCompletePlayer } from "@/app/types/types";
import { useRoleGuard } from "@/hooks/useRoleGaurd";
const CoachesPage = () => {
    useRoleGuard();

    const [searchQuery, setSearchQuery] = useState("");
    const [players, setPlayers] = useState<inCompletePlayer[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
    const fetchPlayers = async () => {
        setLoading(true);
        setError(null);
        try {
        const response = await fetch(
            `/api/player/inComplete?search=${searchQuery}&page=${currentPage}&limit=10`
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        console.log("coach", data)
        setPlayers(data.users);
        setTotalPages(data.totalPages);
        } catch (err) {
        setError((err as Error).message);
        } finally {
        setLoading(false);
        }
    };

    fetchPlayers();
    }, [searchQuery, currentPage]);

    return (
    <div>
        <PageBreadcrumb pageTitle="Players" onSearch={setSearchQuery} />

        {loading && (
            <div className="flex items-center justify-center gap-4 ">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Loading...
            </div>
        )}


        {error && <p className="text-center py-5 text-red-500">{error}</p>}

        {!loading && !error && (
        <IncompletePlayerTable
            data={players}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
        />
        )}
    </div>
    );
};

export default CoachesPage;
