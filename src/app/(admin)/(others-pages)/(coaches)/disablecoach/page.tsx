"use client";
// import { Evaluation } from "@/app/types/types";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CoachTable from "@/components/tables/CoachTable";
import { Coach } from "@/app/types/types";
// import Loading from "@/components/Loading";
import { useRoleGuard } from "@/hooks/useRoleGaurd";
import { useDebounce } from "@/hooks/useDebounce";

const CoachesPage = () => {
  useRoleGuard();

  const [searchQuery, setSearchQuery] = useState("");
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
const [crowned, setCrowned] = useState<boolean | null>(null);
  const [sport, setSport] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const fetchCoaches = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/disablecoach?search=${encodeURIComponent(debouncedSearch)}&sport=${encodeURIComponent(
            sport
          )}&page=${currentPage}&limit=10&crowned=${crowned ? 1 : null}`
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        console.log("coach", data)
        setCoaches(data.coaches);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, [debouncedSearch, currentPage,crowned, sport]);
  //  if (loading) {
  //         return <Loading />;
  //     }

  return (
    <div>
      <PageBreadcrumb pageTitle=" Disabled Coaches" onSearch={setSearchQuery}  onCrowned={(value: string) => {
          setCrowned(value === "1");
          setCurrentPage(1); // ✅ reset page
        }}
        onSport={(value: string) => {
          setSport(value);
          setCurrentPage(1); // ✅ reset page
        }} />

      {loading && (
        <div className="flex items-center justify-center gap-4 ">
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
