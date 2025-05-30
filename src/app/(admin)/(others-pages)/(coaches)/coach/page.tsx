"use client";
// import { Evaluation } from "@/app/types/types";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CoachTable from "@/components/tables/CoachTable";

interface Evaluation {
  id: string;
  evaluationId: number;
  player_id: string;
  playerSlug: string;
  playerFirstName: string;
  firstname: string;
  lastname: string;
  review_title: string;
  primary_video_link: string;
  jerseyNumber: string;
  jerseyColorOne: string;
  positionOne: string;
  status: number;
  turnaroundTime: number;
  payment_status: string;
  rating?: number;
  remarks?: string;
  created_at: string;
  is_deleted: number;
}

interface Coach {
  id: string;
  evaluationId: number;
  firstName: string;
  lastName: string;
  image: string;
  gender: string;
  sport: string;
  totalEvaluations: string;
  status: string;
  history?: string;
  earnings: number;
  evaluations: Evaluation[];
  is_deleted: number;


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
  }, [searchQuery, currentPage]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Coaches" onSearch={setSearchQuery} />

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
