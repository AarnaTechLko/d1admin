"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { GroupIcon } from "lucide-react";

export const EcommerceMetrics = () => {
  const searchParams = useSearchParams();
  const teamsCount = searchParams.get("TeamsPage") || "0";
  const coachesCount = searchParams.get("coach") || "1";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-[1000px]">
      {/* Metric Item: Coches */}
      <div className="rounded-2xl border border-gray-200 bg-sky-100 p-4 dark:border-gray-800 dark:bg-sky-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Coaches</span>
            <h4 className="mt-2 font-bold text-gray-700 text-xl dark:text-white/90">{coachesCount.length}</h4>
          </div>
        </div>
      </div>

      {/* Metric Item: Player */}
      <div className="rounded-2xl border border-gray-200 bg-green-200 p-4 dark:border-gray-800 dark:bg-sky-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Player</span>
            <h4 className="mt-2 font-bold text-gray-700 text-xl dark:text-white/90">5,359</h4>
          </div>
        </div>
      </div>

      {/* Metric Item: Organization */}
      <div className="rounded-2xl border border-gray-200 bg-red-100 p-4 dark:border-gray-800 dark:bg-sky-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Organization</span>
            <h4 className="mt-2 font-bold text-gray-700 text-xl dark:text-white/90">5414</h4>
          </div>
        </div>
      </div>

      {/* Metric Item: Teams */}
      <div className="rounded-2xl border border-gray-200 bg-blue-200 p-4 dark:border-gray-800 dark:bg-sky-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Teams</span>   
            <h4 className="mt-2 font-bold text-gray-700 text-xl dark:text-white/90">{Number(teamsCount).toLocaleString()} </h4>

          </div>
        </div>
      </div>
    </div>
  );
};
