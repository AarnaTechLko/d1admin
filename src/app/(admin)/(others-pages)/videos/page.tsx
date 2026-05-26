"use client";

import React, { useState, useEffect } from "react";
import { useRoleGuard } from "@/hooks/useRoleGaurd";
import VideoPayments from "@/components/videos/VideoPayments";

interface VideoPayment {
  id: number;
  player_id: number;
  coach_id: number;
  booking_id: number;
  amount: string;
  original_amount: string;
  status: string;
  currency: string;
  payment_info: string;
  created_at: string;
  description: string;
  intent_id: string;
  charge_id: string;
  is_deleted: boolean;
  company_amount: string;
  commission_rate: string;
  player_name: string | null;
  coach_name: string | null;
  review_title: string;
   evaluationId: number | null;
}

const VideosPaymentsPage = () => {
  useRoleGuard();

  const [payments, setPayments] = useState<VideoPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch("/api/video-payments");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.success) throw new Error("API returned success: false");
        setPayments(data.payments);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
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
        <VideoPayments payments={payments} />
      )}
    </div>
  );
};

export default VideosPaymentsPage;