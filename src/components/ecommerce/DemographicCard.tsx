"use client";

import Image from "next/image";
import CountryMap from "./CountryMap";
import { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

interface Demographic {
  id: number;
  country: string;
  coaches: number;
  players: number;
  customers: number;
  percentage: number;
  image: string;
}

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<Demographic[]>([]);
  const [loading, setLoading] = useState(true);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/demographics");
        const json = await res.json();

        console.log("API response:", json); // 🔍 Debug
        if (Array.isArray(json)) {
          setData(json);
        } else {
          setData([]); // ✅ fallback to empty array
        }
      } catch (error) {
        console.error("Error fetching demographics:", error);
        setData([]); // ✅ prevent crash
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Customers Demographic
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Number of customers based on country (Coaches + Players)
          </p>
        </div>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreHorizontal className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="px-4 py-6 my-6 overflow-hidden border border-gray-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        <div
          id="mapOne"
          className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
        >
          <CountryMap />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500 text-sm">No data available</p>
      ) : (
        <div className="space-y-5 max-h-[250px] overflow-y-auto pr-2">
          {data.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-none last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="items-center w-full rounded-full max-w-8">
                  <Image
                    width={48}
                    height={48}
                    src={item.image}
                    alt={item.country}
                    className="w-full rounded-full"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                    {item.country}
                  </p>
                  <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                    {item.customers} Customers ({item.coaches} Coaches,{" "}
                    {item.players} Players)
                  </span>
                </div>
              </div>

              <div className="flex w-full max-w-[140px] items-center gap-3">
                <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                  <div
                    className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                  {item.percentage}%
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
