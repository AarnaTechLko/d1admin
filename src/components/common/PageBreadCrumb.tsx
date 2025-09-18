"use client";

import React, { useRef, useState, useEffect } from "react";

interface BreadcrumbProps {
  pageTitle: string;
  // countryList?: string[];
  onSearch: (query: string) => void; // Function to handle search
  onStatus?: (query: string) => void;
  onDays?: (query: string) => void;
  onSport?: (query: string) => void;
}

interface Sport {
  id: number;
  name: string;
}



const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, onSearch, onStatus, onDays, onSport}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");
  const [ticketDays, setTicketDays] = useState("");
  const [sport, setSport] = useState("");
  const [filteredSports, setFilteredSports] = useState<Sport[]>([]);
  // const [filteredCountries, setFilteredCountries] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };


    const sportList = async () => {
      const response = await fetch(
        `/api/sports`
      );

      if (!response.ok) throw new Error("Failed to fetch sports");

      const data = await response.json();

      console.log("DATA: ", data.sport)
      setFilteredSports(data.sport)
    }

    sportList();

    // if (countryList){
    //   setFilteredCountries(countryList);
    // }


    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch(query); // Trigger search in parent component
  };


  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const query = event.target.value;
    setTicketStatus(query);

    if (onStatus){
      onStatus(query);
    }
  }

  const handleDaysChange = (event: React.ChangeEvent<HTMLSelectElement>) => {

    const query = event.target.value;

    console.log("Query: ", query);

    setTicketDays(query);

    if(onDays){
      onDays(query);
    }
  }

  const handleSportsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const query = event.target.value;
    setSport(query);
    if(onSport){
      onSport(query)
    }

  }

  return (
    <div className="flex flex-wrap items-center  gap-3 ">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        {pageTitle}
      </h2>

      {/* Search Bar */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search..."
          className="h-10 w-64 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {["Ticket", "Received Ticket", "Sent Ticket"].includes(pageTitle) &&(

          <>

            <span className="md:ml-5"> Status </span>

            <select className="mt-6 w-64 md:w-40 p-2 md:mt-0 border rounded-lg bg-white" value={ticketStatus} onChange={handleStatusChange}>
              <option value="">Select</option>
              <option value="Pending"> Pending </option>
              <option value="Open"> Open </option>
              <option value="Fixed"> Fixed </option>
              <option value="Closed"> Closed </option>
              <option value="Escalate">Escalate</option>
            </select>


            <span className="md:ml-5"> Days </span>

            <select className="mt-6 w-64 md:w-40 p-2 md:mt-0 border rounded-lg bg-white" value={ticketDays} onChange={handleDaysChange}>
              <option value="15">Select</option>
              <option value="30"> 30 </option>
              <option value="60"> 60 </option>
              <option value="90"> 90 </option>
            </select>

          </>
        )}

        {pageTitle === "Coaches" && (

          <>
            <span className="md: ml-5"> Sports </span>
          
            <select className="mt-6 w-64 md:w-40 p-2 md:mt-0 border rounded-lg bg-white" value={sport} onChange={handleSportsChange}>
              <option value="">Select Sport</option>
                {filteredSports.map((sp) => (
                  <option key={sp.name} value={sp.id}>
                    {sp.name}
                  </option>
                ))}
            </select>  
          

            {/* <select className="mt-6 w-64 md:w-40 p-2 md:mt-0 border rounded-lg bg-white" value={sport} onChange={handleSportsChange}>
              <option value="">Select Sport</option>
              <option value="">Select Country</option>
              {filteredCountries.map((c) => (
                <option key={c} value={c}>
                  {c.country_name}
                </option>
              ))}
            </select> */}

          </>


        )}

      </div>
    </div>
  );
};

export default PageBreadcrumb;
