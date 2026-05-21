"use client";
import React, { useState, useMemo, useRef } from "react";
import { Video, Search, Filter, IndianRupee, CheckCircle2, XCircle, RotateCcw, TrendingUp } from "lucide-react";

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
  joinedDate: string;
  lastSessionDate: string | null;
};

const AVATAR_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-300" },
  { bg: "bg-teal-100 dark:bg-teal-900", text: "text-teal-700 dark:text-teal-300" },
  { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-700 dark:text-purple-300" },
  { bg: "bg-orange-100 dark:bg-orange-900", text: "text-orange-700 dark:text-orange-300" },
  { bg: "bg-green-100 dark:bg-green-900", text: "text-green-700 dark:text-green-300" },
  { bg: "bg-pink-100 dark:bg-pink-900", text: "text-pink-700 dark:text-pink-300" },
];

const INITIAL_COACHES: VideoCoach[] = [
  { id: 1, name: "Rahul Sharma", email: "rahul.sharma@sport.in", sport: "Cricket", phone: "+91 98765 43210", videoEnabled: true, feePerSession: 1500, totalSessions: 48, totalEarnings: 72000, joinedDate: "12 Jan 2024", lastSessionDate: "19 May 2025" },
  { id: 2, name: "Priya Mehta", email: "priya.mehta@sport.in", sport: "Tennis", phone: "+91 91234 56789", videoEnabled: false, feePerSession: 1800, totalSessions: 0, totalEarnings: 0, joinedDate: "03 Mar 2024", lastSessionDate: null },
  { id: 3, name: "Amit Verma", email: "amit.verma@sport.in", sport: "Football", phone: "+91 99887 76655", videoEnabled: true, feePerSession: 2500, totalSessions: 57, totalEarnings: 142500, joinedDate: "18 Feb 2024", lastSessionDate: "20 May 2025" },
  { id: 4, name: "Sunita Rao", email: "sunita.rao@sport.in", sport: "Badminton", phone: "+91 88776 65544", videoEnabled: false, feePerSession: 1000, totalSessions: 0, totalEarnings: 0, joinedDate: "25 Apr 2024", lastSessionDate: null },
  { id: 5, name: "Karan Patel", email: "karan.patel@sport.in", sport: "Basketball", phone: "+91 77665 54433", videoEnabled: true, feePerSession: 2000, totalSessions: 31, totalEarnings: 62000, joinedDate: "09 May 2024", lastSessionDate: "18 May 2025" },
  { id: 6, name: "Deepa Nair", email: "deepa.nair@sport.in", sport: "Swimming", phone: "+91 66554 43322", videoEnabled: true, feePerSession: 1200, totalSessions: 22, totalEarnings: 26400, joinedDate: "21 Jun 2024", lastSessionDate: "15 May 2025" },
  { id: 7, name: "Vikram Singh", email: "vikram.singh@sport.in", sport: "Hockey", phone: "+91 55443 32211", videoEnabled: true, feePerSession: 1750, totalSessions: 40, totalEarnings: 70000, joinedDate: "14 Jul 2024", lastSessionDate: "21 May 2025" },
  { id: 8, name: "Anjali Gupta", email: "anjali.gupta@sport.in", sport: "Athletics", phone: "+91 44332 21100", videoEnabled: false, feePerSession: 900, totalSessions: 0, totalEarnings: 0, joinedDate: "30 Aug 2024", lastSessionDate: null },
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

// Toggle Switch Component
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
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

// Editable Fee Cell
function FeeCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setDraft(String(value));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 10);
  }

  function commit() {
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed >= 0) onChange(parsed);
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
        />
      </div>
    );
  }

  return (
    <button
      onClick={startEdit}
      className="flex items-center gap-1 text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
      title="Click to edit fee"
    >
      <IndianRupee className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
      {value.toLocaleString("en-IN")}
      <span className="text-xs text-gray-400 group-hover:text-blue-400 ml-0.5">(edit)</span>
    </button>
  );
}

export default function CoachVideoSettingsPage() {
  const [coaches, setCoaches] = useState<VideoCoach[]>(INITIAL_COACHES);
  const [search, setSearch] = useState("");
  const [videoFilter, setVideoFilter] = useState("all");
  const [toast, setToast] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<number | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function toggleVideo(id: number, enabled: boolean) {
    setCoaches((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        showToast(`${c.name} video ${enabled ? "enabled" : "disabled"}`);
        return { ...c, videoEnabled: enabled };
      })
    );
  }

  function updateFee(id: number, fee: number) {
    setCoaches((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        showToast(`${c.name} fee updated to ₹${fee.toLocaleString("en-IN")}`);
        return { ...c, feePerSession: fee };
      })
    );
  }

  function disableAndReset(id: number) {
    setCoaches((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        showToast(`${c.name} disabled & sessions reset`);
        return { ...c, videoEnabled: false, totalSessions: 0, totalEarnings: 0, lastSessionDate: null };
      })
    );
    setConfirmReset(null);
  }

  const filtered = useMemo(() => {
    return coaches.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.sport.toLowerCase().includes(q);
      const matchVideo =
        videoFilter === "all" ||
        (videoFilter === "enabled" && c.videoEnabled) ||
        (videoFilter === "disabled" && !c.videoEnabled);
      return matchSearch && matchVideo;
    });
  }, [coaches, search, videoFilter]);

  const summary = useMemo(() => {
    const enabled = coaches.filter((c) => c.videoEnabled);
    const totalSessions = coaches.reduce((s, c) => s + c.totalSessions, 0);
    const totalEarnings = coaches.reduce((s, c) => s + c.totalEarnings, 0);
    const avgFee = enabled.length > 0
      ? Math.round(enabled.reduce((s, c) => s + c.feePerSession, 0) / enabled.length)
      : 0;
    return {
      enabledCount: enabled.length,
      total: coaches.length,
      avgFee,
      totalSessions,
      totalEarnings,
    };
  }, [coaches]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg dark:bg-gray-100 dark:text-gray-900 transition-all">
          {toast}
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
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Video className="w-5 h-5 text-blue-500" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Coach video settings</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View and manage per-coach video access, session fees, and statistics.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Video enabled</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.enabledCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">of {summary.total} coaches</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg. fee per session</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">₹{summary.avgFee.toLocaleString("en-IN")}</p>
          <p className="text-xs text-gray-400 mt-0.5">enabled coaches only</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total sessions</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.totalSessions}</p>
          <p className="text-xs text-gray-400 mt-0.5">across all coaches</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total earnings</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatINR(summary.totalEarnings)}</p>
          <p className="text-xs text-gray-400 mt-0.5">platform-wide</p>
        </div>
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
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Coach</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Video access</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fee / session</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sessions</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total earnings</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last session</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    No coaches found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((coach, i) => {
                  const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  return (
                    <tr key={coach.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ToggleSwitch
                            checked={coach.videoEnabled}
                            onChange={(v) => toggleVideo(coach.id, v)}
                          />
                          <span className={`text-xs font-medium ${coach.videoEnabled ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                            {coach.videoEnabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <FeeCell value={coach.feePerSession} onChange={(v) => updateFee(coach.id, v)} />
                      </td>
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
                      <td className="px-4 py-3">
                        {coach.totalEarnings > 0 ? (
                          <span className="text-gray-900 dark:text-white font-medium">
                            {formatINR(coach.totalEarnings)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {coach.lastSessionDate ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setConfirmReset(coach.id)}
                          disabled={!coach.videoEnabled && coach.totalSessions === 0}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                          title="Disable video access and reset session count"
                        >
                          <RotateCcw className="w-3 h-3" />
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
        {filtered.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>Showing {filtered.length} of {coaches.length} coaches</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              {summary.enabledCount} with video enabled
            </span>
          </div>
        )}
      </div>

      {/* Fee Edit Hint */}
      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        <IndianRupee className="inline w-3 h-3 mb-0.5" /> Click on any fee value to edit it inline. Press Enter to save or Escape to cancel.
      </p>
    </div>
  );
}