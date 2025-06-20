"use client";

import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";


export interface Evaluation {
  id: number;
  player_id: number;
  coach_id: number;
  review_title: string;
  primary_video_link: string;
  jerseyNumber?: string;
  status: number;
  turnaroundTime?: string;
  payment_status?: string;
  created_at: string;
  is_deleted: number;
}

interface EvaluationTableProps {
  data: Evaluation[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const EvaluationTable: React.FC<EvaluationTableProps> = ({
  data,
  loading,
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-200">
      {loading ? (
        <p className="p-6 text-gray-500">
          <Loader2 className="animate-spin text-blue-500" size={18} />
          Loading evaluations...</p>
      ) : data.length === 0 ? (
        <p className="p-6 text-gray-600">No evaluations found.</p>
      ) : (
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-gray-200 border-b text-gray-500 font medium text-sm">
            <tr>
              <th className="px-4 py-3">Player ID</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Video</th>
              <th className="px-4 py-3">Jersey</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Turnaround</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {data.map((ev) => (
              <tr
                key={ev.id}
                className={`${ev.is_deleted === 0 ? "bg-red-100" : "bg-white"
                  } border-b`}
              >
                <td className="px-4 py-3">{ev.player_id}</td>
                <td className="px-4 py-3 text-blue-600">
                  <Link href={`/evaluationdetails?evaluationId=${ev.id}`}>
                    {ev.review_title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={ev.primary_video_link}
                    className="text-blue-500 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch
                  </a>
                </td>
                <td className="px-4 py-3">{ev.jerseyNumber || "N/A"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium text-white ${ev.status === 2 ? "bg-green-500" : "bg-gray-400"
                      }`}
                  >
                    {ev.status === 2 ? "Completed" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3">{ev.turnaroundTime || "-"}</td>
                <td className="px-4 py-3">{ev.payment_status || "-"}</td>
                <td className="px-4 py-3">
                  {new Date(ev.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center p-4 border-t">
          <button
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded disabled:opacity-50"
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="text-sm text-gray-700">Page {currentPage}</div>
          <button
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded disabled:opacity-50"
            onClick={() =>
              setCurrentPage(Math.min(currentPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default EvaluationTable;
