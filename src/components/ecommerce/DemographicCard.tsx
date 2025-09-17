"use client";
import { useEffect, useState } from "react";
import CountryMap from "./CountryMap";
import { Users, GraduationCap } from "lucide-react";

interface CountryData {
  country: string;
  customers: number[]; // total number of customers
  coaches: number;   // total number of coaches
  players: number;   // total number of players
}

export default function DemographicCard() {
  const [countriesData, setCountriesData] = useState<CountryData[]>([]);

  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        const res = await fetch("/api/countries");
        const data: CountryData[] = await res.json();
        setCountriesData(data);
      } catch (err) {
        console.error("Error fetching demographics:", err);
      }
    };

    fetchDemographics();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Customers Demographic
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Number of customers, coaches & players based on country
          </p>
        </div>
      </div>

      {/* Map */}
      <div
        style={{
          height: "300px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CountryMap  />
      </div>

      {/* Scrollable list */}
      <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 mt-6">
        {countriesData.map((country) => {
          const { coaches, players } = country;
        

          return (
          <div
  key={country.country}
  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white/80 dark:bg-gray-800/70 dark:border-gray-700 px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200"
>
  {/* Left Section */}
  <div className="flex items-center gap-3">
    {/* Circle Badge (Country Initial) */}
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-semibold text-sm shadow-md">
      {country.country[0]}
    </div>

    {/* Country Info */}
    <div>
      <p className="font-semibold text-gray-800 dark:text-white/90 text-sm sm:text-base">
        {country.country}
      </p>

      <div className="flex gap-4 mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <GraduationCap size={14} className="text-blue-500" />
          <span>{coaches} Coaches</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={14} className="text-green-500" />
          <span>{players} Players</span>
        </div>
      </div>
    </div>
  </div>
</div>
          );
        })}
      </div>

    
    </div>
  );
}
