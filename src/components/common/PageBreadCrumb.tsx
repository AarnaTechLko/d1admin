"use client";

import React, { useRef, useState, useEffect } from "react";

interface BreadcrumbProps {
  pageTitle: string;
  onSearch: (query: string) => void;
  onStatus?: (query: string) => void;
  onDays?: (query: string) => void;
  onSport?: (query: string) => void;
  onCrowned?: (value: string) => void; // pass "1" or "0"
}

interface Sport {
  id: number;
  name: string;
}

interface CrownedOption {
  value: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({
  pageTitle,
  onSearch,
  onStatus,
  onDays,
  onSport,
  onCrowned,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");
  const [ticketDays, setTicketDays] = useState("");
  const [sport, setSport] = useState("");
  const [isCrowned, setIsCrowned] = useState(false);
  const [filteredSports, setFilteredSports] = useState<Sport[]>([]);
  const [crownedOptions, setCrownedOptions] = useState<CrownedOption[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    const fetchSports = async () => {
      try {
        const response = await fetch(`/api/sports`);
        if (!response.ok) throw new Error("Failed to fetch sports");
        const data = await response.json();
        setFilteredSports(data.sport);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchCrownedOptions = async () => {
      try {
        const response = await fetch(`/api/coach/crowned`);
        if (!response.ok) throw new Error("Failed to fetch crowned options");
        const data = await response.json();
        setCrownedOptions(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSports();
    fetchCrownedOptions();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const query = event.target.value;
    setTicketStatus(query);
    onStatus?.(query);
  };

  const handleDaysChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const query = event.target.value;
    setTicketDays(query);
    onDays?.(query);
  };

  const handleSportsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const query = event.target.value;
    setSport(query);
    onSport?.(query);
  };

  const handleCrownedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked; // boolean from checkbox
    setIsCrowned(isChecked);
    onCrowned?.(isChecked ? "1" : "0"); // pass string "1" or "0"
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        {pageTitle}
      </h2>

      <div className="relative flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search..."
          className="h-10 w-64 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {["Ticket", "Received Ticket", "Sent Ticket"].includes(pageTitle) && (
          <>
            <span className="md:ml-5">Status</span>
            <select
              className="mt-6 w-64 md:w-40 p-2 md:mt-0 border rounded-lg bg-white"
              value={ticketStatus}
              onChange={handleStatusChange}
            >
              <option value="">Select</option>
              <option value="Pending">Pending</option>
              <option value="Open">Open</option>
              <option value="Fixed">Fixed</option>
              <option value="Closed">Closed</option>
              <option value="Escalate">Escalate</option>
            </select>

            <span className="md:ml-5">Days</span>
            <select
              className="mt-6 w-64 md:w-40 p-2 md:mt-0 border rounded-lg bg-white"
              value={ticketDays}
              onChange={handleDaysChange}
            >
              <option value="15">Select</option>
              <option value="30">30</option>
              <option value="60">60</option>
              <option value="90">90</option>
            </select>
          </>
        )}

        {pageTitle === "Coaches" && (
          <>
            <span className="md:ml-5">Sports</span>
            <select
              className="mt-6 w-64 md:w-40 p-2 md:mt-0 border rounded-lg bg-white"
              value={sport}
              onChange={handleSportsChange}
            >
              <option value="">Select Sport</option>
              {filteredSports.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
            {crownedOptions.map((opt) => (
              <input type="hidden" value="{opt.value}" key={opt.value} />
            ))}
            {/* ✅ Single Crowned checkbox */}
            <div className="mt-6 md:mt-0 md:ml-5 inline-flex gap-4 items-center">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isCrowned}
                  onChange={handleCrownedChange} // React passes event automatically
                  className="form-checkbox h-4 w-4 text-green-600 border-gray-300 rounded"
                />

                <span className="font-semibold">Crowned</span>
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PageBreadcrumb;