"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

export const EcommerceMetrics = () => {
  return (
    <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-[1000px]">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-sky-100 p-4 dark:border-gray-800 dark:bg-sky-900 md:p-6" >
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Coches
            </span>
            <h4 className="mt-2 font-bold text-gray-700 text-xl dark:text-white/90">
              3,782
            </h4>
          </div>
          {/* <Badge color="success">
            <ArrowUpIcon className="text-error-500" />
            11.01%
          </Badge> */}
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-green-200 p-4 dark:border-gray-800 dark:bg-sky-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              player
            </span>
            <h4 className="mt-2 font-bold text-gray-700 text-xl dark:text-white/90">
              5,359
            </h4>
          </div>

          
        </div>
      </div>
      {/* extra add column player/coches */}
      <div className="rounded-2xl border border-gray-200 bg-red-100 p-4 dark:border-gray-800 dark:bg-sky-900 md:p-6 " >
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Organization
            </span>
            <h4 className="mt-2 font-bold text-gray-700 text-xl dark:text-white/90">
              1,782
            </h4>
          </div>
         
        </div>
      </div>
{/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}

      <div className="rounded-2xl border border-gray-200 bg-blue-200 p-4 dark:border-gray-800 dark:bg-sky-900 md:p-6 " >
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Teams
            </span>
            <h4 className="mt-2 font-bold text-gray-700 text-xl dark:text-white/90">
              8,782
            </h4>
          </div>
          
        </div>
      </div>
      
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
