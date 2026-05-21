"use client";
import React, { useState, useMemo } from "react";
import { Shield, Lock, LockOpen, Search, Filter } from "lucide-react";

type BlockStatus = {
  evals: boolean;
  videos: boolean;
};

type Player = {
  id: number;
  name: string;
  email: string;
  phone: string;
  sport: string;
  organization: string;
  joinedDate: string;
  blocks: BlockStatus;
};

const AVATAR_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-300" },
  { bg: "bg-teal-100 dark:bg-teal-900", text: "text-teal-700 dark:text-teal-300" },
  { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-700 dark:text-purple-300" },
  { bg: "bg-orange-100 dark:bg-orange-900", text: "text-orange-700 dark:text-orange-300" },
  { bg: "bg-green-100 dark:bg-green-900", text: "text-green-700 dark:text-green-300" },
  { bg: "bg-pink-100 dark:bg-pink-900", text: "text-pink-700 dark:text-pink-300" },
];

const INITIAL_PLAYERS: Player[] = [
  { id: 1, name: "Arjun Singh", email: "arjun.singh@sport.in", phone: "+91 98100 11223", sport: "Cricket", organization: "Delhi Strikers", joinedDate: "10 Jan 2024", blocks: { evals: false, videos: false } },
  { id: 2, name: "Meera Joshi", email: "meera.joshi@sport.in", phone: "+91 97200 22334", sport: "Tennis", organization: "Mumbai Aces", joinedDate: "22 Feb 2024", blocks: { evals: true, videos: false } },
  { id: 3, name: "Rohit Gupta", email: "rohit.gupta@sport.in", phone: "+91 96300 33445", sport: "Football", organization: "Bangalore FC", joinedDate: "05 Mar 2024", blocks: { evals: false, videos: true } },
  { id: 4, name: "Ananya Das", email: "ananya.das@sport.in", phone: "+91 95400 44556", sport: "Badminton", organization: "Kolkata Smashers", joinedDate: "18 Apr 2024", blocks: { evals: false, videos: false } },
  { id: 5, name: "Vikram Tiwari", email: "vikram.tiwari@sport.in", phone: "+91 94500 55667", sport: "Athletics", organization: "Chennai Runners", joinedDate: "30 May 2024", blocks: { evals: true, videos: true } },
  { id: 6, name: "Neha Kapoor", email: "neha.kapoor@sport.in", phone: "+91 93600 66778", sport: "Swimming", organization: "Hyderabad Waves", joinedDate: "12 Jun 2024", blocks: { evals: false, videos: false } },
  { id: 7, name: "Suresh Kumar", email: "suresh.kumar@sport.in", phone: "+91 92700 77889", sport: "Hockey", organization: "Punjab Lions", joinedDate: "25 Jul 2024", blocks: { evals: false, videos: false } },
  { id: 8, name: "Kavya Reddy", email: "kavya.reddy@sport.in", phone: "+91 91800 88990", sport: "Basketball", organization: "Kochi Hoops", joinedDate: "08 Aug 2024", blocks: { evals: true, videos: false } },
  { id: 9, name: "Manish Yadav", email: "manish.yadav@sport.in", phone: "+91 90900 99001", sport: "Volleyball", organization: "Jaipur Spikes", joinedDate: "20 Sep 2024", blocks: { evals: false, videos: true } },
  { id: 10, name: "Pooja Iyer", email: "pooja.iyer@sport.in", phone: "+91 89000 00112", sport: "Table Tennis", organization: "Chennai Spinners", joinedDate: "03 Oct 2024", blocks: { evals: false, videos: false } },
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function getStatusLabel(blocks: BlockStatus) {
  if (blocks.evals && blocks.videos) return "fully-blocked";
  if (blocks.evals || blocks.videos) return "partial";
  return "active";
}

function StatusBadge({ blocks }: { blocks: BlockStatus }) {
  const status = getStatusLabel(blocks);
  if (status === "fully-blocked")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
        <Shield className="w-3 h-3" /> Fully blocked
      </span>
    );
  if (status === "partial")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
        <Shield className="w-3 h-3" /> Partially blocked
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
      <Shield className="w-3 h-3" /> Active
    </span>
  );
}

export default function BlockPlayersPage() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sportFilter, setSportFilter] = useState("all");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function toggleBlock(id: number, field: "evals" | "videos") {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, blocks: { ...p.blocks, [field]: !p.blocks[field] } };
        const action = updated.blocks[field] ? "blocked from" : "unblocked from";
        showToast(`${p.name} ${action} ${field}`);
        return updated;
      })
    );
  }

  function blockAll(id: number) {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        showToast(`${p.name} fully blocked`);
        return { ...p, blocks: { evals: true, videos: true } };
      })
    );
  }

  function unblockAll(id: number) {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        showToast(`${p.name} fully unblocked`);
        return { ...p, blocks: { evals: false, videos: false } };
      })
    );
  }

  const allSports = useMemo(() => {
    const set = new Set(INITIAL_PLAYERS.map((p) => p.sport));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.organization.toLowerCase().includes(q) ||
        p.sport.toLowerCase().includes(q);
      const status = getStatusLabel(p.blocks);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && status === "active") ||
        (statusFilter === "partial" && status === "partial") ||
        (statusFilter === "blocked" && status === "fully-blocked");
      const matchSport = sportFilter === "all" || p.sport === sportFilter;
      return matchSearch && matchStatus && matchSport;
    });
  }, [players, search, statusFilter, sportFilter]);

  const summary = useMemo(() => ({
    total: players.length,
    active: players.filter((p) => getStatusLabel(p.blocks) === "active").length,
    partial: players.filter((p) => getStatusLabel(p.blocks) === "partial").length,
    blocked: players.filter((p) => getStatusLabel(p.blocks) === "fully-blocked").length,
  }), [players]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg dark:bg-gray-100 dark:text-gray-900 transition-all">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-red-500" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Block Players</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Restrict players from accessing evals, videos, or both. Changes take effect immediately.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total players", value: summary.total, color: "bg-gray-50 dark:bg-gray-800" },
          { label: "Active", value: summary.active, color: "bg-green-50 dark:bg-green-900/30" },
          { label: "Partially blocked", value: summary.partial, color: "bg-amber-50 dark:bg-amber-900/30" },
          { label: "Fully blocked", value: summary.blocked, color: "bg-red-50 dark:bg-red-900/30" },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-4`}>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, sport, or organization…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="partial">Partially blocked</option>
            <option value="blocked">Fully blocked</option>
          </select>
        </div>
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
        >
          <option value="all">All sports</option>
          {allSports.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Player</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sport / Org</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Block evals</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Block videos</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Quick actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    No players found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((player, i) => {
                  const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  return (
                    <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${av.bg} ${av.text}`}>
                            {getInitials(player.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{player.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{player.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 dark:text-white">{player.sport}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{player.organization}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge blocks={player.blocks} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleBlock(player.id, "evals")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            player.blocks.evals
                              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {player.blocks.evals ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                          {player.blocks.evals ? "Unblock evals" : "Block evals"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleBlock(player.id, "videos")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            player.blocks.videos
                              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {player.blocks.videos ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                          {player.blocks.videos ? "Unblock videos" : "Block videos"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => blockAll(player.id)}
                            disabled={player.blocks.evals && player.blocks.videos}
                            className="px-2.5 py-1.5 rounded-lg text-xs border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-red-800 dark:text-red-400 transition-colors"
                          >
                            Block all
                          </button>
                          <button
                            onClick={() => unblockAll(player.id)}
                            disabled={!player.blocks.evals && !player.blocks.videos}
                            className="px-2.5 py-1.5 rounded-lg text-xs border border-green-200 text-green-600 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-green-800 dark:text-green-400 transition-colors"
                          >
                            Unblock all
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            Showing {filtered.length} of {players.length} players
          </div>
        )}
      </div>
    </div>
  );
}