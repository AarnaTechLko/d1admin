"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CoachTable from "@/components/tables/CoachTable";

interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  gender: string;
  sport: string;
  history?: string;
  totalEvaluations: string;
  status: string;
  earnings: number;
}

const CoachesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoaches = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/coach?search=${searchQuery}&page=${currentPage}&limit=10`
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setCoaches(data.coaches);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, [searchQuery, currentPage]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Coaches" onSearch={setSearchQuery} />
      
      {loading && <p className="text-center py-5">Loading...</p>}
      {error && <p className="text-center py-5 text-red-500">{error}</p>}
      
      {!loading && !error && (
        <CoachTable
          data={coaches}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default CoachesPage;
