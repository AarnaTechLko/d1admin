"use client";

import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

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
}

interface BookingFlow {
  booking_id: number;
  status: string;
  booking_type: string | null;
  created_at: string | null;
  has_evaluation: boolean;
  evaluation_amount: string | null;
  video_amount: string | null;
  payment_status: string | null;
  payment_created_at: string | null;
}

interface PlayerStat {
  player_id: number;
  total_bookings: number;
  completed_bookings: number;
  scheduled_bookings: number;
  cancelled_bookings: number;
  cancellation_rate: number;
  total_video_spent: number;
  total_eval_received: number;
  booking_flow: BookingFlow[];
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
}

interface ApiResponse {
  success: boolean;
  summary: PaymentSummary;
  bookings: BookingSummary;
  playerStats: PlayerStat[];
  payments: VideoPayment[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
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

function Badge({
  label,
  variant,
}: {
  label: string;
  variant: "completed" | "scheduled" | "cancelled" | "pending" | "failed" | "refunded" | "default";
}) {
  const map: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    scheduled: "bg-blue-50 text-blue-500 border border-blue-200",
    cancelled: "bg-red-50 text-red-600 border border-red-200",
    pending: "bg-amber-50 text-amber-600 border border-amber-200",
    failed: "bg-red-50 text-red-600 border border-red-200",
    refunded: "bg-sky-50 text-sky-600 border border-sky-200",
    default: "bg-gray-50 text-gray-500 border border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${map[variant] ?? map.default}`}>
      {label}
    </span>
  );
}

function FlowStep({
  active,
  done,
  label,
  sub,
}: {
  active?: boolean;
  done?: boolean;
  label: string;
  sub?: string;
}) {
  const dotClass = done
    ? "bg-emerald-500 border-emerald-500"
    : active
    ? "bg-blue-500 border-blue-500"
    : "bg-white border-gray-300";

  const labelClass = done
    ? "text-emerald-600"
    : active
    ? "text-blue-500"
    : "text-gray-400";

  return (
    <div className="flex items-start gap-2.5">
      <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border-2 transition-all duration-200 ${dotClass}`} />
      <div>
        <p className={`text-xs font-semibold ${labelClass}`}>{label}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
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
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++)
      pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
      <p className="text-xs text-gray-400">
        {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => page > 1 && onChange(page - 1)}
          disabled={page === 1}
          className="h-[30px] w-[30px] flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="text-xs text-gray-400 px-1">…</span>
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
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChevronLeft = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevronRight = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
const ChevronDown = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

// ─── Player Row (expandable) ───────────────────────────────────────────────────

function PlayerRow({ player }: { player: PlayerStat }) {
  const [open, setOpen] = useState(false);

  const cancelRateClass =
    player.cancellation_rate > 50
      ? "bg-red-50 text-red-600"
      : player.cancellation_rate > 25
      ? "bg-amber-50 text-amber-600"
      : "bg-emerald-50 text-emerald-600";

  return (
    <>
      <tr
        className={`cursor-pointer transition-colors duration-150 ${open ? "bg-blue-50" : "hover:bg-gray-50/70"}`}
        onClick={() => setOpen((o) => !o)}
      >
        <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono text-sm text-blue-500 align-middle">{player.player_id}</td>
        <td className="px-[18px] py-3.5 border-b border-gray-100 text-center text-sm align-middle">{player.total_bookings}</td>
        <td className="px-[18px] py-3.5 border-b border-gray-100 text-center text-sm text-emerald-500 align-middle">{player.completed_bookings}</td>
        <td className="px-[18px] py-3.5 border-b border-gray-100 text-center text-sm text-blue-500 align-middle">{player.scheduled_bookings}</td>
        <td className="px-[18px] py-3.5 border-b border-gray-100 text-center text-sm text-red-500 align-middle">{player.cancelled_bookings}</td>
        <td className="px-[18px] py-3.5 border-b border-gray-100 text-center align-middle">
          <span className={`font-mono text-xs font-semibold px-2 py-1 rounded-md ${cancelRateClass}`}>
            {player.cancellation_rate.toFixed(1)}%
          </span>
        </td>
        <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono text-sm text-emerald-500 align-middle">{fmt(player.total_video_spent)}</td>
        <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono text-sm text-blue-500 align-middle">{fmt(player.total_eval_received)}</td>
        <td className="px-[18px] py-3.5 border-b border-gray-100 text-right align-middle">
          <span className={`inline-flex text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}>
            <ChevronDown />
          </span>
        </td>
      </tr>

      {open && (
        <tr className="bg-blue-50/40">
          <td colSpan={9}>
            <div className="px-5 py-5">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3.5">
                Complete Booking Flow — Player #{player.player_id}
              </p>
              {player.booking_flow.length === 0 ? (
                <p className="text-sm text-gray-400">No active bookings</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {player.booking_flow.map((bf) => (
                    <div
                      key={bf.booking_id}
                      className="bg-white border border-gray-200 rounded-xl p-4 min-w-[220px] max-w-[280px] flex-1 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="font-mono text-xs text-gray-400">
                          Booking #{bf.booking_id}
                        </span>
                        <Badge
                          label={bf.status}
                          variant={bf.status as "completed" | "scheduled"}
                        />
                      </div>
                      <div className="flex flex-col gap-0">
                        <FlowStep
                          done={bf.status === "completed"}
                          active={bf.status === "scheduled"}
                          label={bf.status === "completed" ? "Video Call — Done" : "Video Call — Scheduled"}
                          sub={bf.created_at ? `Booked ${fmtDate(bf.created_at)}` : undefined}
                        />
                        <div className="w-0.5 h-4 bg-gray-200 ml-[7px]" />
                        <FlowStep
                          done={!!bf.video_amount}
                          active={bf.status === "completed" && !bf.video_amount}
                          label="Payment Processed"
                          sub={bf.video_amount ? `${fmt(parseFloat(bf.video_amount))}` : "Awaiting payment"}
                        />
                        <div className="w-0.5 h-4 bg-gray-200 ml-[7px]" />
                        <FlowStep
                          done={bf.has_evaluation && bf.payment_status === "completed"}
                          active={bf.has_evaluation && bf.payment_status !== "completed"}
                          label="Evaluation"
                          sub={
                            bf.has_evaluation
                              ? `${fmt(parseFloat(bf.evaluation_amount ?? "0"))} · ${bf.payment_status}`
                              : "Pending evaluation"
                          }
                        />
                      </div>
                      {bf.booking_type && (
                        <p className="text-[11px] text-gray-400 mt-2.5 border-t border-gray-100 pt-2">
                          Type: {bf.booking_type}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab = "payments" | "players";

export default function VideoPaymentsDashboard() {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null);
  const [payments, setPayments] = useState<VideoPayment[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payPage, setPayPage] = useState(1);
  const [playerPage, setPlayerPage] = useState(1);
  const [tab, setTab] = useState<Tab>("payments");

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
        setPlayerStats(data.playerStats);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pagedPayments = payments.slice((payPage - 1) * PAGE_SIZE, payPage * PAGE_SIZE);
  const pagedPlayers = playerStats.slice((playerPage - 1) * PAGE_SIZE, playerPage * PAGE_SIZE);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3.5 bg-gray-50">
        <div className="w-9 h-9 rounded-full border-[2.5px] border-blue-100 border-t-blue-500 animate-spin" />
        <p className="text-sm text-gray-400">Loading dashboard…</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-1.5 bg-gray-50">
        <p className="text-base font-bold text-red-600">Failed to load</p>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 bg-gray-50 min-h-screen">

      {/* Header */}
      <header className="flex items-center gap-3.5 mb-8">
        <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
          <svg className="w-[22px] h-[22px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
          </svg>
        </div>
        <div>
          <p className="text-xl font-bold tracking-tight text-gray-900"> Finance</p>
        </div>
      </header>

      {/* ── Summary Cards ── */}
      {summary && bookingSummary && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5 mb-7">

          <StatCard
            label="Video Payments"
            value={fmt(summary.totalVideoPayment)}
            sub={`${summary.totalRecords} records`}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            }
          />

          <StatCard
            label="Evaluation Payouts"
            value={fmt(summary.totalEvaluationPayment)}
            sub="Net to coaches"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-500"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            }
          />

         <StatCard
            label="Platform Revenue"
            value={fmt(summary.totalCompanyRevenue)}
            sub="Commission earned"
            iconBg="bg-teal-50"
            iconColor="text-teal-500"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-8-6h16" />
              </svg>
            }
          /> 

         <StatCard
            label="Total Bookings"
            value={bookingSummary.total.toLocaleString()}
            sub={`${bookingSummary.completed} completed · ${bookingSummary.scheduled} scheduled`}
            iconBg="bg-violet-50"
            iconColor="text-violet-500"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
              </svg>
            }
          /> 

          <StatCard
            label="Video Cancellation"
            value={`${bookingSummary.cancellationRate.toFixed(1)}%`}
            sub={`${bookingSummary.cancelled} cancelled of ${bookingSummary.total}`}
            iconBg="bg-red-50"
            iconColor="text-red-500"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            }
          />

          <StatCard
            label="Gross Total"
            value={fmt(summary.totalCombined)}
            sub="Video + evaluation"
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
            }
          />
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-5 bg-white border border-gray-200 rounded-[10px] p-1 w-fit">
        <button
          className={`px-[18px] py-[7px] rounded-[7px] text-[13px] font-semibold border-none cursor-pointer transition-all duration-150 ${
            tab === "payments"
              ? "bg-blue-500 text-white shadow-[0_2px_8px_rgba(59,130,246,0.25)]"
              : "bg-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("payments")}
        >
          Payment Records
        </button>
         <button
          className={`px-[18px] py-[7px] rounded-[7px] text-[13px] font-semibold border-none cursor-pointer transition-all duration-150 ${
            tab === "players"
              ? "bg-blue-500 text-white shadow-[0_2px_8px_rgba(59,130,246,0.25)]"
              : "bg-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("players")}
        >
          Player Stats
        </button> 
      </div>

      {/* ── Payment Records Table ── */}
      {tab === "payments" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="text-[13px] font-bold text-gray-900">Payment Records</p>
            <span className="font-mono text-[11px] bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5 text-gray-400">
              {payments.length} rows
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["ID", "Player", "Coach", "Booking", "Video Pmt", "Eval Pmt", "Company Amt", "Commission", "Status", "Currency", "Created"].map((h) => (
                    <th
                      key={h}
                      className="px-[8px] py-1.5 text-left text-[10.5px] font-bold uppercase tracking-[0.07em] text-gray-400 bg-gray-50/80 border-b border-gray-100 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-12 py-12 text-center text-sm text-gray-400">
                      No records found
                    </td>
                  </tr>
                ) : (
                  pagedPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono text-blue-500 align-middle">{p.id}</td>
                      <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono text-gray-500 align-middle">{p.player_id}</td>
                      <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono text-gray-500 align-middle">{p.coach_id}</td>
                      <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono text-gray-500 align-middle">{p.booking_id}</td>
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
                        <Badge label={p.status} variant={p.status as "completed" | "pending" | "failed" | "refunded"} />
                      </td>
                      <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono text-[11px] uppercase text-gray-400 align-middle">{p.currency}</td>
                      <td className="px-[18px] py-3.5 border-b border-gray-100 font-mono text-[11px] text-gray-400 align-middle">{fmtDate(p.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={payPage} total={payments.length} pageSize={PAGE_SIZE} onChange={setPayPage} />
        </div>
      )}

      {/* ── Player Stats Table ── */}
      {tab === "players" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="text-[13px] font-bold text-gray-900">Player Stats &amp; Booking Flow</p>
            <span className="font-mono text-[11px] bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5 text-gray-400">
              {playerStats.length} players
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {[
                    { label: "Player ID", align: "left" },
                    { label: "Total Bookings", align: "center" },
                    { label: "Videos Done", align: "center" },
                    { label: "Scheduled", align: "center" },
                    { label: "Cancelled", align: "center" },
                    { label: "Cancel Rate", align: "center" },
                    { label: "Video Spent", align: "left" },
                    { label: "Eval Received", align: "left" },
                    { label: "", align: "right" },
                  ].map((h, i) => (
                    <th
                      key={i}
                      style={{ textAlign: h.align as "left" | "center" | "right" }}
                      className="px-[18px] py-2.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-gray-400 bg-gray-50/80 border-b border-gray-100 whitespace-nowrap"
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-12 py-12 text-center text-sm text-gray-400">
                      No player data found
                    </td>
                  </tr>
                ) : (
                  pagedPlayers.map((player) => (
                    <PlayerRow key={player.player_id} player={player} />
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={playerPage} total={playerStats.length} pageSize={PAGE_SIZE} onChange={setPlayerPage} />
        </div>
      )}
    </div>
  );
}