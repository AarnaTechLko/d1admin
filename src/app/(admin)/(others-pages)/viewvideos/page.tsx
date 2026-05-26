"use client";

import React, { useState, useEffect } from "react";
import { useRoleGuard } from "@/hooks/useRoleGaurd";
import ViewVideos from "@/components/videos/ViewVideos";

interface Booking {
  id: number;
  coach_id: number;
  player_id: number;
  evaluation_id: number;
  start_time: string;
  end_time: string;
  status: string;
  coach_name: string | null;
  player_name: string | null;
  evaluation_title: string | null;
}

const ViewVideosPage = () => {
  useRoleGuard();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`/api/bookings`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.success) throw new Error("API returned success: false");
        setBookings(data.bookings);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div>
      {loading && (
        <div className="flex items-center justify-center gap-4 py-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">Loading...</span>
        </div>
      )}

      {error && (
        <p className="text-center py-5 text-red-500">{error}</p>
      )}

      {!loading && !error && (
        <ViewVideos bookings={bookings} />
      )}
    </div>
  );
};

export default ViewVideosPage;