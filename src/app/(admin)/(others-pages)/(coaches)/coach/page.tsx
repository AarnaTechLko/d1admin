"use client";
// import { Evaluation } from "@/app/types/types";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CoachTable from "@/components/tables/CoachTable";
// import Loading from '@/components/Loading';

import { Coach } from "@/app/types/types";
import { useRoleGuard } from "@/hooks/useRoleGaurd";
const CoachesPage = () => {
      useRoleGuard();
    const [allCoaches, setAllCoaches] = useState<Coach[]>([]);
const [crowned, setCrowned] = useState<string[]>([]); // ✅ array of strings
  const [searchQuery, setSearchQuery] = useState("");
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sport, setSport] = useState("");
  // const [filteredCountries, setFilteredCountries] = useState<string[]>([]);


  useEffect(() => {
    const fetchCoaches = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/coach?search=${searchQuery}&page=${currentPage}&limit=10&sport=${sport}`
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        console.log("coach", data)
        setCoaches(data.coaches);
         setAllCoaches(data.coaches); 
        setTotalPages(data.totalPages);

        // const uniqueCountries = [...new Set(data.map((item) => item.country).filter(Boolean))] as string[];
        // setFilteredCountries(uniqueCountries);

      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, [searchQuery, currentPage, sport]);
//  if (loading) {
//         return <Loading />;
//     }
useEffect(() => {
  let filtered = [...allCoaches];

  if (crowned.length > 0) { // check if any checkbox is selected
    filtered = filtered.filter((coach) =>
      crowned.includes(coach.verified.toString())
    );
  }

  setCoaches(filtered);
}, [crowned, allCoaches]);

  return (
    <div>
<PageBreadcrumb 
  pageTitle="Coaches" 
  onSearch={setSearchQuery} 
  onSport={setSport} 
  onCrowned={(selected: string[]) => setCrowned(selected)} // ✅ correct type
/>
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
