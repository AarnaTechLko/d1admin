"use client";

import { useEffect, useState } from "react";

interface PaymentSummary {
  totalVideoPayment: number;
  totalEvaluationPayment: number;
  totalCombined: number;
  totalCompanyRevenue: number;
  totalRecords: number;
}

interface BookingSummary {
  total: number;
  completed: number;
  scheduled: number;
  cancelled: number;
  cancellationRate: number;
  videoCancellationRate: number;
  videoCancelledCount: number;
  videoBookingsTotal: number;
}

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
}

interface ApiResponse {
  success: boolean;
  summary: PaymentSummary;
  bookings: BookingSummary;
  payments: VideoPayment[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n);

const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "—";


const PAGE_SIZE = 10;
const STATUS_FILTERS = ["All", "authorized", "cancelled", "captured"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

// ─── Standard Stat Card ───────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, iconBg, iconColor,
}: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; iconBg: string; iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-start gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-px">
      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
        <p className="text-[22px] font-bold tracking-tight text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Cancellation Stat Card (Enhanced) ───────────────────────────────────────

function CancellationCard({
  count,
  rate,
  cancelledAmount,
}: {
  count: number;
  rate: number;
  cancelledAmount: number;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-px">
      {/* Top row: icon + label */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-red-50 text-red-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <p className="text-[9.5px] font-semibold uppercase tracking-widest text-gray-400">
          Video Cancellations
        </p>
      </div>

      {/* Three metrics row */}
      <div className="grid grid-cols-3 gap-3">

        {/* Total Cancelled */}
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total</p>
          <p className="text-[20px] font-bold text-gray-900 leading-none">{count}</p>
          {/* <p className="text-[10.5px] text-gray-400 mt-0.5">bookings</p> */}
        </div>

        {/* Divider */}
        <div className="flex flex-col gap-0.5 border-l border-r border-gray-100 px-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Ratio</p>
          <p className="text-[20px] font-bold text-red-500 leading-none">
            {rate.toFixed(1)}%
          </p>
         {/*  <p className="text-[10.5px] text-gray-400 mt-0.5">of total</p> */}
        </div>

        {/* Cancelled Amount */}
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Amount</p>
          <p className="text-[17px] font-bold text-red-500 leading-none">
            {fmt(cancelledAmount)}
          </p>
         {/*  <p className="text-[10.5px] text-gray-400 mt-0.5">lost revenue</p> */}
        </div>

      </div>

      {/* Progress bar showing cancellation ratio */}
      {/* <div className="mt-4">
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(rate, 100)}%` }}
          />
        </div>
      </div> */}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ status }: { status: string }) {
  const map: Record<string, { dot: string; text: string; bg: string; border: string }> = {
    authorized: { dot: "bg-violet-500", text: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
    captured: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    cancelled: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
    pending: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    refunded: { dot: "bg-sky-500", text: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200" },
    failed: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  };
  const key = status?.toLowerCase() ?? "";
  const style = map[key] ?? {
    dot: "bg-gray-400", text: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${style.dot}`} />
      {status}
    </span>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, total, pageSize, onChange }: {
  page: number; total: number; pageSize: number; onChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }
  const btnBase = "h-[28px] min-w-[28px] px-1.5 rounded-lg text-[12px] font-semibold flex items-center justify-center transition-all duration-150";
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <p className="text-[12px] text-gray-400">
        {total === 0
          ? "No records"
          : `${Math.min((page - 1) * pageSize + 1, total)}–${Math.min(page * pageSize, total)} of ${total}`}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => page > 1 && onChange(page - 1)} disabled={page === 1}
          className={`${btnBase} border border-gray-200 text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="text-[12px] text-gray-400 px-1">…</span>
          ) : (
            <button key={p} onClick={() => onChange(p as number)}
              className={`${btnBase} ${p === page ? "bg-blue-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 border border-transparent"}`}>
              {p}
            </button>
          )
        )}
        <button onClick={() => page < totalPages && onChange(page + 1)} disabled={page === totalPages}
          className={`${btnBase} border border-gray-200 text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function VideoPaymentsDashboard() {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null);
  const [payments, setPayments] = useState<VideoPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payPage, setPayPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/video-payments");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiResponse = await res.json();
        if (!data.success) throw new Error("API returned success: false");
        setSummary(data.summary);
        setBookingSummary(data.bookings);
        setPayments(data.payments);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Derived: total cancelled amount from payments array ──
  const cancelledAmount = payments
    .filter((p) => p.status?.toLowerCase() === "cancelled")
    .reduce((sum, p) => sum + parseFloat(p.original_amount ?? "0"), 0);

  const filteredPayments =
    statusFilter === "All"
      ? payments
      : payments.filter((p) => p.status?.toLowerCase() === statusFilter.toLowerCase());

  const handleFilterChange = (f: StatusFilter) => {
    setStatusFilter(f);
    setPayPage(1);
  };

  const pagedPayments = filteredPayments.slice(
    (payPage - 1) * PAGE_SIZE,
    payPage * PAGE_SIZE
  );

  // ── Loading ──
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3.5 bg-gray-50">
        <div className="w-9 h-9 rounded-full border-[2.5px] border-blue-100 border-t-blue-500 animate-spin" />
        <p className="text-sm text-gray-400">Loading dashboard…</p>
      </div>
    );

  // ── Error ──
  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-1.5 bg-gray-50">
        <p className="text-base font-bold text-red-600">Failed to load</p>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <header className="flex items-center gap-3.5 mb-8">
        <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
          <svg className="w-[22px] h-[22px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
          </svg>
        </div>
        <p className="text-xl font-bold tracking-tight text-gray-900">Finance</p>
      </header>

      {/* ── Summary Cards ── */}
      {summary && bookingSummary && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5 mb-7">

          {/* Video Payments */}
          <StatCard
            label="Video Payments"
            value={fmt(summary.totalVideoPayment)}
            sub={`${summary.totalRecords} records`}
            iconBg="bg-blue-50" iconColor="text-blue-500"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            }
          />

          {/* Evaluation Payouts */}
          <StatCard
            label="Evaluation Payouts"
            value={fmt(summary.totalEvaluationPayment)}
            sub="Net to coaches"
            iconBg="bg-emerald-50" iconColor="text-emerald-500"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            }
          />

          {/* ── Enhanced Cancellation Card ── */}
          <CancellationCard
            count={bookingSummary.videoCancelledCount}
            rate={bookingSummary.videoCancellationRate}
            cancelledAmount={cancelledAmount}
          />

          {/* Gross Total */}
          <StatCard
            label="Gross Total"
            value={fmt(summary.totalCombined)}
            sub="Video + Evaluation"
            iconBg="bg-amber-50" iconColor="text-amber-500"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
            }
          />
        </div>
      )}

      {/* ── Payment Records Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            <p className="text-[14px] font-semibold text-gray-900">Video Payment Records</p>
            <span className="font-mono text-[11px] bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5 text-gray-400">
              {filteredPayments.length} rows
            </span>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((f) => {
              const count =
                f === "All"
                  ? payments.length
                  : payments.filter((p) => p.status?.toLowerCase() === f.toLowerCase()).length;
              const isActive = statusFilter === f;
              const colorMap: Record<string, string> = {
                All: isActive ? "bg-slate-800 text-white border-slate-800" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100",
                authorized: isActive ? "bg-violet-600 text-white border-violet-600" : "bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100",
                cancelled: isActive ? "bg-red-600 text-white border-red-600" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100",
                captured: isActive ? "bg-emerald-600 text-white border-emerald-600" : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100",
              };
              return (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-150 ${colorMap[f]}`}
                >
                  <span className="capitalize">{f}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20" : "bg-black/5"}`}>
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
              <tr className="bg-gray-50/80">
                {["Sr. No", "Player", "Coach", "Video Pmt", "Eval Pmt", "Company Amt", "Commission", "Status", "Currency", "Created"].map((h) => (
                  <th key={h}
                    className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-gray-400 border-b border-gray-100 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-12 py-14 text-center text-[13px] text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      No records found
                    </div>
                  </td>
                </tr>
              ) : (
                pagedPayments.map((p, index) => {
                  const srNo = (payPage - 1) * PAGE_SIZE + index + 1;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">

                      {/* Sr. No */}
                      <td className="px-4 py-3 border-b border-gray-100 align-middle">
                        <span className="font-mono text-[12px] text-gray-400 font-medium">{srNo}</span>
                      </td>

                      {/* Player */}
                      <td className="px-4 py-3 border-b border-gray-100 align-middle">
                        <div className="flex items-center gap-2">
                         {/*  <Avatar name={p.player_name} variant="blue" /> */}
                          <span className="font-medium text-gray-800 text-[13px]">{p.player_name ?? "—"}</span>
                        </div>
                      </td>

                      {/* Coach */}
                      <td className="px-4 py-3 border-b border-gray-100 align-middle">
                        <div className="flex items-center gap-2">
                          {/* <Avatar name={p.coach_name} variant="green" /> */}
                          <span className="font-medium text-gray-800 text-[13px]">{p.coach_name ?? "—"}</span>
                        </div>
                      </td>

                      {/* Video Pmt */}
                      <td className="px-4 py-3 border-b border-gray-100 align-middle">
                        <span className="font-mono text-[12px] font-semibold text-blue-600">
                          {fmt(parseFloat(p.original_amount ?? "0"), p.currency)}
                        </span>
                      </td>

                      {/* Eval Pmt */}
                      <td className="px-4 py-3 border-b border-gray-100 align-middle">
                        <span className="font-mono text-[12px] font-semibold text-emerald-600">
                          {fmt(parseFloat(p.amount ?? "0"), p.currency)}
                        </span>
                      </td>

                      {/* Company Amt */}
                      <td className="px-4 py-3 border-b border-gray-100 align-middle">
                        <span className="font-mono text-[12px] text-gray-500">
                          {fmt(parseFloat(p.company_amount ?? "0"), p.currency)}
                        </span>
                      </td>

                      {/* Commission */}
                      <td className="px-4 py-3 border-b border-gray-100 align-middle">
                        <span className="font-mono text-[12px] text-gray-400">
                          {parseFloat(p.commission_rate ?? "0").toFixed(2)}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 border-b border-gray-100 align-middle">
                        <Badge status={p.status} />
                      </td>

                      {/* Currency */}
                      <td className="px-4 py-3 border-b border-gray-100 align-middle">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">
                          {p.currency}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3 border-b border-gray-100 align-middle">
                        <span className="font-mono text-[11.5px] text-gray-400">
                          {fmtDate(p.created_at)}
                        </span>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={payPage}
          total={filteredPayments.length}
          pageSize={PAGE_SIZE}
          onChange={setPayPage}
        />
      </div>

    </div>
  );
}