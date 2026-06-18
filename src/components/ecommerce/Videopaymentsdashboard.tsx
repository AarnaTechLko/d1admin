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

// ─── Standard Stat Card ───────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, iconBg, iconColor,
}: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; iconBg: string; iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-start gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-px h-full">
      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400 mb-1 truncate">{label}</p>
        <p className="text-[22px] font-bold tracking-tight text-gray-900 leading-none truncate">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-1.5 truncate">{sub}</p>}
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
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-px flex flex-col justify-between h-full">
      {/* Top row: icon + label */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-red-50 text-red-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <p className="text-[9.5px] font-semibold uppercase tracking-widest text-gray-400 truncate">
          Video Cancellations
        </p>
      </div>

      {/* Three metrics row */}
      <div className="grid grid-cols-3 gap-1 text-center sm:text-left">
        {/* Total Cancelled */}
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total</p>
          <p className="text-[18px] lg:text-[20px] font-bold text-gray-900 leading-none truncate">{count}</p>
        </div>

        {/* Ratio */}
        <div className="flex flex-col gap-0.5 border-l border-r border-gray-100 ">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Ratio</p>
          <p className="text-[18px] lg:text-[20px] font-bold text-red-500 leading-none truncate">
            {rate.toFixed(1)}%
          </p>
        </div>

        {/* Cancelled Amount */}
        <div className="flex flex-col gap-0.5 pl-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Amount</p>
          <p className="text-[15px] lg:text-[17px] font-bold text-red-500 leading-none truncate">
            {fmt(cancelledAmount)}
          </p>
        </div>
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

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/video-payments");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiResponse = await res.json();
        console.log("API Response:", data);
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

  // ── Derived: total cancelled amount ──
  const cancelledAmount = payments
    .filter((p) => p.status?.toLowerCase() === "cancelled")
    .reduce((sum, p) => sum + parseFloat(p.original_amount ?? "0"), 0);

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
    <div className="max-w-[1400px] mx-auto px-6 py-10 bg-gray-50">

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7 items-stretch">

          {/* Video Payments */}
          <StatCard
            label="Video Earnings"
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
            label="Evaluation Earnings"
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
          <StatCard
            label="Gross Earnings"
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
          {/* ── Enhanced Cancellation Card ── */}
          <CancellationCard
            count={bookingSummary.videoCancelledCount}
            rate={bookingSummary.videoCancellationRate}
            cancelledAmount={cancelledAmount}
          />

          {/* Gross Total */}

        </div>
      )}
    </div>
  );
}