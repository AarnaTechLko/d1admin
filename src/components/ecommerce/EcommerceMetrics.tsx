"use client";
import React, { useEffect, useState } from "react";
// import Badge from "../ui/badge/Badge";
// import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { GroupIcon } from "lucide-react";
// import { useRouter } from "next/navigation";


interface Team {
  id: string;
}

interface Coach {
  id: string;
  
}
interface player {
  id: string;
  
}

interface Organization {
  id: string;
 
}



export const EcommerceMetrics = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
     const [players, setplayers] = useState<player[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);
  

    {/**teams api data */}
    useEffect(() => {
      const fetchTeams = async () => {
     
        try {
          const id = "someId"; // Set your id here
          const response = await fetch(`/api/teams?id=${id}`);
          
          const data = await response.json();
    
          console.log("API Response:", data); // ✅ Debugging line
          setTeams(data.teams || []);

        }  catch (err) {
          console.error("Error fetching teams:", err);
        }
      };
    
      fetchTeams();
    }, []);
    {/*teams api data end here */}

    {/**coaches api data */}
    useEffect(() => {
      const fetchCoaches = async () => {
       
        try {
          const id = "someId"; // Set your id here
          const response = await fetch(`/api/coach?id=${id}`);
          
          const data = await response.json();
    
          console.log("API Response:", data); // ✅ Debugging line
          setCoaches(data.coaches || []);

        }  catch (err) {
          console.error("Error fetching teams:", err);
        }
      };
    
      fetchCoaches();
    }, []);
    {/**coaches api data end here */}

     {/**player api data */}

     useEffect(() => {
      const fetchplayers = async () => {
       
        try {
          const id = "someId"; // Set your id here
          const response = await fetch(`/api/player?id=${id}`);
          
          const data = await response.json();
    
          console.log("API Response:", data); // ✅ Debugging line
          setplayers(data.coaches || []);

        }  catch (err) {
          console.error("Error fetching teams:", err);
        }
      };
    
      fetchplayers();
    }, []);
    {/*player api data end here */}    

    {/**ORGANIZATION api data */}

    useEffect(() => {
      const fetchOrganizations = async () => {
      
        try {
          const id = "someId"; // Set your id here
          const response = await fetch(`/api/organization?id=${id}`);
          
          const data = await response.json();
    
          console.log("API Response:", data); // ✅ Debugging line
          setOrganizations(data.enterprises || []);

        }  catch (err) {
          console.error("Error fetching teams:", err);
        }
      };
    
      fetchOrganizations();
    }, []);
    {/**ORGANIZATION api data end here */}

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
            {coaches.length}
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
            {players.length}
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
            {organizations.length}
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
            {teams.length}
            </h4>
          </div>
          
        </div>
      </div>
      
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
