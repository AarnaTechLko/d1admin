"use client";

import React, { useState } from "react";

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
  start_time?: string | null;   // NEW
  end_time?: string | null;     // NEW
}

const fmt = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n);

const fmtDate = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtDateTime = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const PAGE_SIZE = 10;

const STATUS_FILTERS = ["All", "authorized", "cancelled", "captured"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function Badge({
  label,
}: {
  label: string;
  variant:
    | "completed"
    | "scheduled"
    | "cancelled"
    | "pending"
    | "failed"
    | "refunded"
    | "authorized"
    | "captured"
    | "default";
}) {
  const map: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    scheduled: "bg-blue-50 text-blue-500 border border-blue-200",
    cancelled: "bg-red-50 text-red-600 border border-red-200",
    pending: "bg-amber-50 text-amber-600 border border-amber-200",
    failed: "bg-red-50 text-red-600 border border-red-200",
    refunded: "bg-sky-50 text-sky-600 border border-sky-200",
    authorized: "bg-violet-50 text-violet-600 border border-violet-200",
    captured: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    default: "bg-gray-50 text-gray-500 border border-gray-200",
  };
  const key = label?.toLowerCase() ?? "default";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
        map[key] ?? map.default
      }`}
    >
      {label}
    </span>
  );
}

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
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
      <p className="text-xs text-gray-400">
        {Math.min((page - 1) * pageSize + 1, total)}–
        {Math.min(page * pageSize, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => page > 1 && onChange(page - 1)}
          disabled={page === 1}
          className="h-[30px] w-[30px] flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
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
              className={`h-[30px] min-w-[30px] px-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                p === page
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => page < totalPages && onChange(page + 1)}
          disabled={page === totalPages}
          className="h-[30px] w-[30px] flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
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

interface VideoPaymentsProps {
  payments: VideoPayment[];
  viewAs?: "player" | "coach"; // NEW — pass "player" from PlayerDetailPage, "coach" from CoachDetailPage
}

export default function VideoPayments({
  payments = [],
  viewAs,
}: VideoPaymentsProps) {
  const [payPage, setPayPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const filteredPayments =
    statusFilter === "All"
      ? payments
      : payments.filter(
          (p) => p.status?.toLowerCase() === statusFilter.toLowerCase()
        );

  const handleFilterChange = (f: StatusFilter) => {
    setStatusFilter(f);
    setPayPage(1);
  };

  const pagedPayments = filteredPayments.slice(
    (payPage - 1) * PAGE_SIZE,
    payPage * PAGE_SIZE
  );

  
  const showStartEnd = viewAs === "player" || viewAs === "coach";

  const headers = [
    ...(viewAs !== "player" ? ["Player"] : []),
    ...(viewAs !== "coach" ? ["Coach"] : []),
    ...(showStartEnd ? ["Start Time", "End Time"] : []),
    "Video Pmt",
    "Eval Pmt",
    "Company Amt",
    "Commission",
    "Status",
    "Currency",
    "Created",
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header with filter pills */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <p className="text-[13px] font-bold text-gray-900">Payment Records</p>
          <span className="font-mono text-[11px] bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5 text-gray-400">
            {filteredPayments.length} rows
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {STATUS_FILTERS.map((f) => {
            const count =
              f === "All"
                ? payments.length
                : payments.filter(
                    (p) => p.status?.toLowerCase() === f.toLowerCase()
                  ).length;
            const isActive = statusFilter === f;
            const colorMap: Record<string, string> = {
              All: isActive
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200",
              authorized: isActive
                ? "bg-violet-500 text-white"
                : "bg-violet-50 text-violet-600 hover:bg-violet-100",
              cancelled: isActive
                ? "bg-red-500 text-white"
                : "bg-red-50 text-red-600 hover:bg-red-100",
              captured: isActive
                ? "bg-emerald-500 text-white"
                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
            };
            return (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${colorMap[f]}`}
              >
                <span className="capitalize">{f}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white/20" : "bg-black/5"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-[0.07em] text-gray-400 bg-gray-50/80 border-b border-gray-100 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedPayments.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-12 py-12 text-center text-sm text-gray-400"
                >
                  No records found
                </td>
              </tr>
            ) : (
              pagedPayments.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  {/* Player name — hidden on player profile */}
                  {viewAs !== "player" && (
                    <td className="px-[18px] py-3.5 border-b border-gray-100 text-gray-700 align-middle">
                      {p.player_name ?? "—"}
                    </td>
                  )}

                  {/* Coach name — hidden on coach profile */}
                  {viewAs !== "coach" && (
                    <td className="px-[18px] py-3.5 border-b border-gray-100 text-gray-700 align-middle">
                      {p.coach_name ?? "—"}
                    </td>
                  )}

                  {/* Start Time — shown instead of the hidden name column */}
                  {showStartEnd && (
                    <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono text-[11px] text-gray-500 align-middle whitespace-nowrap">
                      {fmtDateTime(p.start_time)}
                    </td>
                  )}

                  {/* End Time */}
                  {showStartEnd && (
                    <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono text-[11px] text-gray-500 align-middle whitespace-nowrap">
                      {fmtDateTime(p.end_time)}
                    </td>
                  )}

                  <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono font-semibold text-blue-500 align-middle">
                    {fmt(parseFloat(p.original_amount ?? "0"), p.currency)}
                  </td>
                  <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono font-semibold text-emerald-500 align-middle">
                    {fmt(parseFloat(p.amount ?? "0"), p.currency)}
                  </td>
                  <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono text-gray-500 align-middle">
                    {fmt(parseFloat(p.company_amount ?? "0"), p.currency)}
                  </td>
                  <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono text-gray-400 align-middle">
                    {parseFloat(p.commission_rate ?? "0").toFixed(2)}%
                  </td>
                  <td className="px-[18px] py-3.5 border-b border-gray-100 align-middle">
                    <Badge
                      label={p.status}
                      variant={
                        p.status?.toLowerCase() as
                          | "authorized"
                          | "cancelled"
                          | "captured"
                      }
                    />
                  </td>
                  <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono text-[11px] uppercase text-gray-400 align-middle">
                    {p.currency}
                  </td>
                  <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono text-[11px] text-gray-400 align-middle">
                    {fmtDate(p.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={payPage}
        total={filteredPayments.length}
        pageSize={PAGE_SIZE}
        onChange={setPayPage}
      />
    </div>
  );
}