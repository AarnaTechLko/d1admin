"use client";
import Link from "next/link";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "—";

const fmtTime = (d: string | null) =>
  d
    ? new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    : "—";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  "All",
  "booked",
  "accepted",
  "declined",
  "cancelled",
  "suggestion_pending",
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const BADGE_STYLES: Record<string, string> = {
  booked: "bg-blue-50 text-blue-600 border border-blue-200",
  accepted: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  declined: "bg-red-50 text-red-500 border border-red-200",
  cancelled: "bg-orange-50 text-orange-500 border border-orange-200",
  suggestion_pending: "bg-amber-50 text-amber-600 border border-amber-200",
  default: "bg-gray-100 text-gray-500 border border-gray-200",
};

const FILTER_STYLES: Record<string, { active: string; inactive: string }> = {
  All: {
    active: "bg-gray-900 text-white shadow-sm",
    inactive: "bg-gray-100 text-gray-500 hover:bg-gray-200",
  },
  booked: {
    active: "bg-blue-500 text-white shadow-sm",
    inactive: "bg-blue-50 text-blue-600 hover:bg-blue-100",
  },
  accepted: {
    active: "bg-emerald-500 text-white shadow-sm",
    inactive: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
  },
  declined: {
    active: "bg-red-500 text-white shadow-sm",
    inactive: "bg-red-50 text-red-500 hover:bg-red-100",
  },
  cancelled: {
    active: "bg-orange-500 text-white shadow-sm",
    inactive: "bg-orange-50 text-orange-500 hover:bg-orange-100",
  },
  suggestion_pending: {
    active: "bg-amber-500 text-white shadow-sm",
    inactive: "bg-amber-50 text-amber-600 hover:bg-amber-100",
  },
};

const STATUS_DOT: Record<string, string> = {
  booked: "bg-blue-400",
  accepted: "bg-emerald-400",
  declined: "bg-red-400",
  cancelled: "bg-orange-400",
  suggestion_pending: "bg-amber-400",
  default: "bg-gray-400",
};

const LABEL: Record<string, string> = {
  All: "All",
  suggestion_pending: "Suggestion Pending",
  booked: "Booked",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
};

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ label }: { label: string }) {
  const key = label?.toLowerCase() ?? "default";
  const dot = STATUS_DOT[key] ?? STATUS_DOT.default;
  const style = BADGE_STYLES[key] ?? BADGE_STYLES.default;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${style}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {LABEL[key] ?? label}
    </span>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
      <p className="text-xs text-gray-400 font-medium">
        Showing{" "}
        <span className="text-gray-600 font-semibold">
          {total === 0 ? 0 : (page - 1) * pageSize + 1}
        </span>
        –
        <span className="text-gray-600 font-semibold">
          {Math.min(page * pageSize, total)}
        </span>{" "}
        of <span className="text-gray-600 font-semibold">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => page > 1 && onChange(page - 1)}
          disabled={page === 1}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:text-gray-700 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-gray-200"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="text-xs text-gray-400 px-1">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition-all duration-150 ${p === page
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-500 hover:bg-white hover:shadow-sm hover:border-gray-200 border border-transparent"
                }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => page < totalPages && onChange(page + 1)}
          disabled={page === totalPages}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:text-gray-700 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-gray-200"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface ViewVideosProps {
  bookings: Booking[];
}

export default function ViewVideos({ bookings = [] }: ViewVideosProps) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  // Dialog state — defined here in the main component (not inside Pagination)
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Fetch cancellation reason ──────────────────────────────────────────────
  const handleViewReason = async (bookingId: number) => {
    setOpen(true);
    setLoading(true);
    setReason("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancellation-reason`);
      const data = await res.json();
      if (data.success) {
        setReason(data.reason || "No reason found.");
      } else {
        setReason("Failed to load reason.");
      }
    } catch (error) {
      console.error(error);
      setReason("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Filter & paginate ──────────────────────────────────────────────────────
  const filtered =
    statusFilter === "All"
      ? bookings
      : bookings.filter((b) => b.status?.toLowerCase() === statusFilter);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (f: StatusFilter) => {
    setStatusFilter(f);
    setPage(1);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
                Video Bookings
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {filtered.length} of {bookings.length} total bookings
              </p>
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_FILTERS.map((f) => {
                const count =
                  f === "All"
                    ? bookings.length
                    : bookings.filter((b) => b.status?.toLowerCase() === f)
                      .length;
                const isActive = statusFilter === f;
                const style = FILTER_STYLES[f];
                return (
                  <button
                    key={f}
                    onClick={() => handleFilterChange(f)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${isActive ? style.active : style.inactive
                      }`}
                  >
                    <span>{LABEL[f] ?? f}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/25" : "bg-black/10"
                        }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-4 py-2 text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-gray-400 border-b border-gray-100 w-16">
                  Sr.No
                </th>
                <th className="px-4 py-2 text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-gray-400 border-b border-gray-100">
                  Player
                </th>
                <th className="px-4 py-2 text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-gray-400 border-b border-gray-100">
                  Coach
                </th>
                <th className="px-4 py-2 text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-gray-400 border-b border-gray-100">
                  Evaluation
                </th>
                <th className="px-4 py-2 text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-gray-400 border-b border-gray-100">
                  Schedule
                </th>
                <th className="px-4 py-2 text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-gray-400 border-b border-gray-100">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-500">
                        No bookings found
                      </p>
                      <p className="text-xs text-gray-400">
                        Try selecting a different status filter
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((b, idx) => (
                  <tr
                    key={b.id}
                    className={`group transition-colors duration-100 hover:bg-blue-50/30 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                  >
                    {/* Sr.No */}
                    <td className="px-4 py-2 align-middle">
                      <span className="font-mono text-[12px] font-semibold text-gray-500">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </span>
                    </td>

                    {/* Player */}
                    <td className="px-4 py-2 align-middle">
                      <span className="text-[13px] font-medium text-gray-800 whitespace-nowrap">
                        {b.player_name ?? "—"}
                      </span>
                    </td>

                    {/* Coach */}
                    <td className="px-4 py-2 align-middle">
                      <span className="text-[13px] font-medium text-gray-800 whitespace-nowrap">
                        {b.coach_name ?? "—"}
                      </span>
                    </td>

                    {/* Evaluation */}
                    <td className="px-4 py-2 align-middle max-w-[220px]">
                      {b.evaluation_title ? (
                        <Link
                          href={`/evaluationdetails?evaluationId=${b.evaluation_id}`}
                          className="text-[13px] text-gray-600 truncate hover:underline cursor-pointer"
                          title={b.evaluation_title}
                        >
                          {b.evaluation_title.length > 20
                            ? b.evaluation_title.slice(0, 20) + "..."
                            : b.evaluation_title}
                        </Link>
                      ) : (
                        <span className="text-[13px] text-gray-400">—</span>
                      )}
                    </td>

                    {/* Schedule */}
                    <td className="px-4 py-2 align-middle">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <svg
                            className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5"
                            />
                          </svg>
                          <span className="text-[12px] font-medium text-gray-700">
                            {fmtDate(b.start_time)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-5">
                          <span className="text-[11px] text-gray-400">
                            {fmtTime(b.start_time)}
                          </span>
                          <span className="text-[11px] text-gray-300">→</span>
                          <span className="text-[11px] text-gray-400">
                            {fmtTime(b.end_time)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <Badge label={b.status ?? "—"} />
                        {["cancelled", "declined"].includes(
                          b.status?.toLowerCase().trim() || ""
                        ) && (
                            <button
                              onClick={() => handleViewReason(b.id)}
                              className="px-2 py-1 text-xs font-medium rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition"
                            >
                              Reason
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>

      {/* Cancellation Reason Dialog — outside the table, inside the fragment */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancellation Reason</DialogTitle>
          </DialogHeader>
          <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
            {loading ? "Loading..." : reason}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}