"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CoachTable from "@/components/tables/CoachTable";
import { Coach } from "@/app/types/types";
import { useRoleGuard } from "@/hooks/useRoleGaurd";

const CoachesPage = () => {
  useRoleGuard();

  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [crowned, setCrowned] = useState<boolean>(false); // single checkbox
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sport, setSport] = useState("");

  // Fetch coaches from API
  // Fetch coaches from API with crowned filter
useEffect(() => {
  const fetchCoaches = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/coach?search=${searchQuery}&page=${currentPage}&limit=10&sport=${sport}&crowned=${crowned ? 1 : 0}`
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
}, [searchQuery, currentPage, sport, crowned]);



  return (
    <div>
      <PageBreadcrumb
        pageTitle="Coaches"
        onSearch={setSearchQuery}
        onSport={setSport}
        onCrowned={(value: string) => setCrowned(value === "1")}
      />

      {loading && (
        <div className="flex items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      )}

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
