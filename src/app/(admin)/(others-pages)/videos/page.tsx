"use client";

import React, { useState, useEffect, useCallback } from "react";
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const LIMIT = 10;

const VideosPaymentsPage = () => {
  useRoleGuard();

  const [payments, setPayments] = useState<VideoPayment[]>([]);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/video-payments?page=${page}&limit=${LIMIT}`
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error("API returned success: false");
      }

      setPayments(data.payments ?? []);

      setPagination(
        data.pagination ?? {
          page: 1,
          limit: LIMIT,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) {
      return;
    }

    fetchPayments(newPage);
  };

  return (
    <div>
      {loading && (
        <div className="flex items-center justify-center gap-4 py-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">
            Loading...
          </span>
        </div>
      )}

      {error && (
        <p className="py-5 text-center text-red-500">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <VideoPayments payments={payments} />

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium">
                  {(pagination.page - 1) *
                    pagination.limit +
                    1}
                </span>{" "}
                –{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.page *
                      pagination.limit,
                    pagination.total
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {pagination.total}
                </span>{" "}
                records
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handlePageChange(
                      pagination.page - 1
                    )
                  }
                  disabled={
                    pagination.page === 1
                  }
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {Array.from(
                  {
                    length:
                      pagination.totalPages,
                  },
                  (_, i) => i + 1
                )
                  .filter(
                    (p) =>
                      p === 1 ||
                      p ===
                        pagination.totalPages ||
                      Math.abs(
                        p -
                          pagination.page
                      ) <= 1
                  )
                  .reduce<
                    (number | "...")[]
                  >((acc, p, idx, arr) => {
                    if (
                      idx > 0 &&
                      p -
                        (arr[
                          idx - 1
                        ] as number) >
                          1
                    ) {
                      acc.push("...");
                    }

                    acc.push(p);

                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-gray-400"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() =>
                          handlePageChange(
                            Number(item)
                          )
                        }
                        className={`px-3 py-1.5 text-sm rounded border ${
                          pagination.page ===
                          item
                            ? "bg-blue-500 text-white border-blue-500"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                <button
                  onClick={() =>
                    handlePageChange(
                      pagination.page + 1
                    )
                  }
                  disabled={
                    pagination.page ===
                    pagination.totalPages
                  }
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideosPaymentsPage;