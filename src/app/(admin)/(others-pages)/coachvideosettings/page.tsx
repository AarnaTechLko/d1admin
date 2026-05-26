"use client";
import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Video, Search, Filter, IndianRupee, CheckCircle2, XCircle,
  RotateCcw, TrendingUp, RefreshCw, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type VideoCoach = {
  id: number;
  name: string;
  email: string;
  sport: string;
  phone: string;
  videoEnabled: boolean;
  feePerSession: number;
  totalSessions: number;
  totalEarnings: number;
  joinedDate: string | null;
  lastSessionDate: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-300" },
  { bg: "bg-teal-100 dark:bg-teal-900", text: "text-teal-700 dark:text-teal-300" },
  { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-700 dark:text-purple-300" },
  { bg: "bg-orange-100 dark:bg-orange-900", text: "text-orange-700 dark:text-orange-300" },
  { bg: "bg-green-100 dark:bg-green-900", text: "text-green-700 dark:text-green-300" },
  { bg: "bg-pink-100 dark:bg-pink-900", text: "text-pink-700 dark:text-pink-300" },
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(amount);
}

// ─── API helpers ──────────────────────────────────────────────────────────────
async function fetchCoaches(search: string, video: string): Promise<VideoCoach[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (video !== "all") params.set("video", video);
  const res = await fetch(`/api/coach/video-settings?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to load coaches (${res.status})`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? "Unknown error");
  return json.data;
}

async function patchCoach(id: number, payload: Partial<{ videoEnabled: boolean; feePerSession: number }>) {
  const res = await fetch(`/api/coach/video-settings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error ?? `Request failed (${res.status})`);
  }
}

async function resetCoach(id: number) {
  const res = await fetch(`/api/coach/video-settings/${id}/reset`, { method: "POST" });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error ?? `Request failed (${res.status})`);
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ToggleSwitch({
  checked, onChange, disabled,
}: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function FeeCell({
  value, onChange, disabled,
}: { value: number; onChange: (v: number) => Promise<void>; disabled?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    if (disabled) return;
    setDraft(String(value));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 10);
  }

  async function commit() {
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed !== value) {
      setSaving(true);
      await onChange(parsed).finally(() => setSaving(false));
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-gray-400 text-sm">₹</span>
        <input
          ref={inputRef}
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
          className="w-20 px-2 py-1 text-sm border border-blue-400 rounded focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          min={0}
          step={50}
          disabled={saving}
        />
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />}
      </div>
    );
  }

  return (
    <button
      onClick={startEdit}
      disabled={disabled}
      className="flex items-center gap-1 text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors group disabled:opacity-40 disabled:cursor-not-allowed"
      title="Click to edit fee"
    >
      <IndianRupee className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
      {value.toLocaleString("en-IN")}
      <span className="text-xs text-gray-400 group-hover:text-blue-400 ml-0.5">(edit)</span>
    </button>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" style={{ width: `${[140, 70, 80, 50, 90, 80, 100][i]}px` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Pagination component ─────────────────────────────────────────────────────
function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Build page number array with ellipsis logic
  const pages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const result: (number | "...")[] = [];
    if (currentPage <= 4) {
      result.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      result.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      result.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return result;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  const btnBase =
    "inline-flex items-center justify-center h-8 min-w-[2rem] px-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Record range */}
      <p className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
        Showing <span className="font-medium text-gray-700 dark:text-gray-200">{startItem}–{endItem}</span> of{" "}
        <span className="font-medium text-gray-700 dark:text-gray-200">{totalItems}</span> coaches
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`${btnBase} text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700`}
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${btnBase} text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700`}
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {pages.map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="inline-flex items-center justify-center h-8 w-8 text-sm text-gray-400"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`${btnBase} ${
                page === currentPage
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${btnBase} text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700`}
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${btnBase} text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700`}
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CoachVideoSettingsPage() {
  const [coaches, setCoaches] = useState<VideoCoach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [videoFilter, setVideoFilter] = useState("all");

  // ── Pagination state ──
  const [currentPage, setCurrentPage] = useState(1);

  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [confirmReset, setConfirmReset] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, videoFilter]);

  // ── Fetch ──
  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const data = await fetchCoaches(debouncedSearch, videoFilter);
      setCoaches(data);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, videoFilter]);

  useEffect(() => { load(true); }, [load]);

  // ── Pagination derived values ──
  const totalPages = Math.max(1, Math.ceil(coaches.length / PAGE_SIZE));

  // Clamp currentPage if coaches shrink (e.g. after filter change)
  const safePage = Math.min(currentPage, totalPages);

  const pagedCoaches = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return coaches.slice(start, start + PAGE_SIZE);
  }, [coaches, safePage]);

  function handlePageChange(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    // Scroll table into view smoothly
    document.getElementById("coaches-table")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── Toast ──
  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }

function setPending(id: number, on: boolean) {
  setPendingIds((prev) => {
    const next = new Set(prev);

    if (on) {
      next.add(id);
    } else {
      next.delete(id);
    }

    return next;
  });
}
  // ── Toggle video ──
  async function toggleVideo(id: number, enabled: boolean) {
    const coach = coaches.find((c) => c.id === id);
    setPending(id, true);
    setCoaches((prev) => prev.map((c) => c.id === id ? { ...c, videoEnabled: enabled } : c));
    try {
      await patchCoach(id, { videoEnabled: enabled });
      showToast(`${coach?.name} video ${enabled ? "enabled" : "disabled"}`);
    } catch (e: unknown) {
      setCoaches((prev) => prev.map((c) => c.id === id ? { ...c, videoEnabled: !enabled } : c));
      showToast((e as Error).message, "err");
    } finally {
      setPending(id, false);
    }
  }

  // ── Update fee ──
  async function updateFee(id: number, fee: number) {
    const coach = coaches.find((c) => c.id === id);
    const prev_fee = coach?.feePerSession ?? 0;
    setPending(id, true);
    setCoaches((prev) => prev.map((c) => c.id === id ? { ...c, feePerSession: fee } : c));
    try {
      await patchCoach(id, { feePerSession: fee });
      showToast(`${coach?.name} fee updated to ₹${fee.toLocaleString("en-IN")}`);
    } catch (e: unknown) {
      setCoaches((prev) => prev.map((c) => c.id === id ? { ...c, feePerSession: prev_fee } : c));
      showToast((e as Error).message, "err");
    } finally {
      setPending(id, false);
    }
  }

  // ── Disable & reset ──
  async function disableAndReset(id: number) {
    const coach = coaches.find((c) => c.id === id);
    setConfirmReset(null);
    setPending(id, true);
    try {
      await resetCoach(id);
      setCoaches((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, videoEnabled: false, totalSessions: 0, totalEarnings: 0, lastSessionDate: null }
            : c
        )
      );
      showToast(`${coach?.name} disabled & reset`);
    } catch (e: unknown) {
      showToast((e as Error).message, "err");
    } finally {
      setPending(id, false);
    }
  }

  // ── Summary (always across all coaches, not just current page) ──
  const summary = useMemo(() => {
    const enabled = coaches.filter((c) => c.videoEnabled);
    return {
      enabledCount: enabled.length,
      total: coaches.length,
      avgFee: enabled.length > 0
        ? Math.round(enabled.reduce((s, c) => s + c.feePerSession, 0) / enabled.length)
        : 0,
      totalSessions: coaches.reduce((s, c) => s + c.totalSessions, 0),
      totalEarnings: coaches.reduce((s, c) => s + c.totalEarnings, 0),
    };
  }, [coaches]);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 text-sm px-4 py-2.5 rounded-lg shadow-lg transition-all flex items-center gap-2 ${
            toast.type === "err"
              ? "bg-red-600 text-white"
              : "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
          }`}
        >
          {toast.type === "err" && <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Confirm Reset Modal */}
      {confirmReset !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-80 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Disable & reset coach?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              This will disable video access and reset session history to zero for{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {coaches.find((c) => c.id === confirmReset)?.name}
              </span>. This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmReset(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => disableAndReset(confirmReset)}
                className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Yes, disable & reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Video className="w-5 h-5 text-blue-500" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Coach video settings</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage per-coach video access, session fees, and statistics.
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => load(true)} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            bg: "bg-blue-50 dark:bg-blue-900/30",
            label: "Video enabled",
            value: loading ? "…" : summary.enabledCount,
            sub: loading ? "" : `of ${summary.total} coaches`,
          },
          {
            bg: "bg-green-50 dark:bg-green-900/30",
            label: "Avg. fee / session",
            value: loading ? "…" : `₹${summary.avgFee.toLocaleString("en-IN")}`,
            sub: "enabled coaches only",
          },
          {
            bg: "bg-purple-50 dark:bg-purple-900/30",
            label: "Total sessions",
            value: loading ? "…" : summary.totalSessions,
            sub: "across all coaches",
          },
          {
            bg: "bg-amber-50 dark:bg-amber-900/30",
            label: "Total earnings",
            value: loading ? "…" : formatINR(summary.totalEarnings),
            sub: "platform-wide",
          },
        ].map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-4`}>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by coach name, email, or sport…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={videoFilter}
            onChange={(e) => setVideoFilter(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="all">All coaches</option>
            <option value="enabled">Video enabled</option>
            <option value="disabled">Video disabled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div id="coaches-table" className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {["Coach", "Video access", "Fee / session", "Sessions", "Total earnings",  "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
              ) : coaches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    No coaches found matching your filters.
                  </td>
                </tr>
              ) : (
                pagedCoaches.map((coach, i) => {
                  // Use global index for consistent avatar colors across pages
                  const globalIdx = (safePage - 1) * PAGE_SIZE + i;
                  const av = AVATAR_COLORS[globalIdx % AVATAR_COLORS.length];
                  const busy = pendingIds.has(coach.id);
                  return (
                    <tr
                      key={coach.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${busy ? "opacity-70" : ""}`}
                    >
                      {/* Coach */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${av.bg} ${av.text}`}>
                            {getInitials(coach.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{coach.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{coach.sport}</p>
                          </div>
                        </div>
                      </td>

                      {/* Toggle */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {busy ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <ToggleSwitch
                              checked={coach.videoEnabled}
                              onChange={(v) => toggleVideo(coach.id, v)}
                              disabled={busy}
                            />
                          )}
                          <span className={`text-xs font-medium ${coach.videoEnabled ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                            {coach.videoEnabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </td>

                      {/* Fee */}
                      <td className="px-4 py-3">
                        <FeeCell
                          value={coach.feePerSession}
                          onChange={(v) => updateFee(coach.id, v)}
                          disabled={busy}
                        />
                      </td>

                      {/* Sessions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {coach.totalSessions > 0 ? (
                            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                          )}
                          <span className={coach.totalSessions > 0 ? "text-gray-900 dark:text-white" : "text-gray-400"}>
                            {coach.totalSessions}
                          </span>
                        </div>
                      </td>

                      {/* Earnings */}
                      <td className="px-4 py-3">
                        {coach.totalEarnings > 0 ? (
                          <span className="text-gray-900 dark:text-white font-medium">
                            {formatINR(coach.totalEarnings)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Last session */}
                      {/* <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {coach.lastSessionDate ?? "—"}
                      </td> */}

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setConfirmReset(coach.id)}
                          disabled={busy || (!coach.videoEnabled && coach.totalSessions === 0)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                          title="Disable video access and reset session count"
                        >
                          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                          Disable &amp; reset
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer — replaces the old simple footer */}
        {!loading && coaches.length > 0 && (
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={coaches.length}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Enabled count badge (shown below table when paginated) */}
      {!loading && coaches.length > 0 && (
        <div className="mt-2 flex items-center justify-end gap-1 text-xs text-gray-400 dark:text-gray-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          {summary.enabledCount} of {summary.total} coaches have video enabled
        </div>
      )}

      {/* Hint */}
      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        <IndianRupee className="inline w-3 h-3 mb-0.5" /> Click on any fee value to edit it inline. Press Enter to save or Escape to cancel.
      </p>
    </div>
  );
}