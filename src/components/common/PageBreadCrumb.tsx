"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BreadcrumbProps {
  pageTitle: string;
  onSearch: (query: string) => void;
  onStatus?: (query: string) => void;
  onDays?: (query: string) => void;
  onSport?: (query: string) => void;
  onCrowned?: (value: string) => void; // "1" or "0"
  onStaff?: (staffId: string) => void;

}

interface Sport {
  id: number;
  name: string;
}

interface CrownedOption {
  value: string;
}

interface Staff {
  name: string;
  id: number;
  username: string;
  role: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({
  pageTitle,
  onSearch,
  onStatus,
  onDays,
  onSport,
  onCrowned,
  onStaff,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");
  const [ticketDays, setTicketDays] = useState("");
  const [sport, setSport] = useState("");
  const [isCrowned, setIsCrowned] = useState(false);
  const [staffId, setStaffId] = useState("");
  const router = useRouter();

  const [filteredSports, setFilteredSports] = useState<Sport[]>([]);
  const [crownedOptions, setCrownedOptions] = useState<CrownedOption[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    // ✅ Fetch Sports
    const fetchSports = async () => {
      try {
        const response = await fetch(`/api/sports`);
        const data = await response.json();
        setFilteredSports(Array.isArray(data?.sport) ? data.sport : []);
      } catch (err) {
        console.error("Sports error:", err);
      }
    };

    // ✅ Fetch Crowned Options
    const fetchCrownedOptions = async () => {
      try {
        const response = await fetch(`/api/coach/crowned`);
        const data = await response.json();
        setCrownedOptions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Crowned error:", err);
      }
    };

    // ✅ Fetch Subadmin Staff List
    const fetchStaff = async () => {
      try {
        const response = await fetch(`/api/subadmin`);
        const data = await response.json();
        console.log("data6776", data);

        // ✅ Your backend returns: { admin: [...] }
        const list = data?.admin || [];

        setStaffList(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Staff error:", err);
      }
    };


    fetchSports();
    fetchCrownedOptions();
    fetchStaff();

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ✅ Search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  // ✅ Status
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const query = e.target.value;
    setTicketStatus(query);
    onStatus?.(query);
  };

  // ✅ Days
  const handleDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const query = e.target.value;
    setTicketDays(query);
    onDays?.(query);
  };

  // ✅ Sports
  const handleSportsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const query = e.target.value;
    setSport(query);
    onSport?.(query);
  };

  // ✅ Crowned
  const handleCrownedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsCrowned(checked);
    onCrowned?.(checked ? "1" : "0");
  };

  // ✅ Staff
  const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setStaffId(id);
    onStaff?.(id);
  };

  return (
    <>
      <div className=" pb-4">
{["View Ticket", "Recieved Ticket", "Ticket"].includes(pageTitle) && (
          <button
            onClick={() => router.push("/createticket")}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
          >
            + Create Ticket
          </button>
        )}</div>
          <h2 className="text-xl pb-4 font-semibold text-gray-800 dark:text-white/90">
        {pageTitle}
      </h2>

    <div className="flex flex-wrap items-center gap-3">
    
    
      <div className="relative flex flex-wrap items-center gap-3">
        {/* ✅ Search Box */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search..."
          className="h-10 w-64 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
        />


        {["View Ticket", "Recieved Ticket", "Sent Ticket"].includes(pageTitle) && (
          <>
            <span className="md:ml-5">Staff</span>

            <select
              className=" w-64 md:w-40 p-2 border rounded-lg bg-white"
              value={staffId}
              onChange={handleStaffChange}
            >
              <option value="">All Staff</option>

              {staffList?.length > 0 &&
                staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.username || s.name}       {/* ✅ Safe fallback */}
                  </option>
                ))}
            </select>
          </>
        )}
        {/* ✅ Status */}
       {pageTitle !== "Admin List" && (
  <>
    <span className="md:ml-5">Status</span>
    <select
      className="w-64 md:w-40 p-2 border rounded-lg bg-white"
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
  </>
)}


        {/* ✅ Days */}
        <span className="md:ml-5">Days</span>
        <select
          className="w-64 md:w-40 p-2 border rounded-lg bg-white"
          value={ticketDays}
          onChange={handleDaysChange}
        >
          <option value="">Select</option>
          <option value="15">15</option>
          <option value="30">30</option>
          <option value="60">60</option>
          <option value="90">90</option>
        </select>




        {/* ✅ Coaches Page Filters */}
        {pageTitle === "Coaches" && (
          <>
            {/* ✅ Sports */}
            <span className="md:ml-5">Sports</span>
            <select
              className="mt-6 w-64 md:w-40 p-2 border rounded-lg bg-white"
              value={sport}
              onChange={handleSportsChange}
            >
              <option value="">Select Sport</option>
              {filteredSports?.length > 0 &&
                filteredSports.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name}
                  </option>
                ))}
            </select>

            {/* ✅ Hidden Crowned Values */}
            {crownedOptions?.length > 0 &&
              crownedOptions.map((opt) => (
                <input type="hidden" value={opt.value} key={opt.value} />
              ))}

            {/* ✅ Crowned Checkbox */}
            <div className="mt-6 md:mt-0 md:ml-5 inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={isCrowned}
                onChange={handleCrownedChange}
                className="h-4 w-4"
              />
              <span className="font-semibold">Crowned</span>
            </div>
          </>
        )}
        
      </div>

    </div>
    </>
  );
};

export default PageBreadcrumb;
