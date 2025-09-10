"use client";
import React, { useEffect, useState } from "react";

import { GroupIcon } from "lucide-react";
// interface Coach {
//   id: string; 
// }
// interface player {
//   id: string;
// }
interface Organization {
  id: string;
}
export const EcommerceMetrics = () => {
    // const [teams, setTeams] = useState<Team[]>([]);
    // const [totalPages, setTotalPages] = useState<number>(1);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
     const [players, setPlayers] = useState<number>(0);
    const [coaches, setCoaches] = useState<number>(0);
    // const [error, setError] = useState<string | null>(null);
    // const [loading, setLoading] = useState<boolean>(true);
    // const router = useRouter();

    {/**teams api data */}
    useEffect(() => {
      const fetchTeams = async () => {
        // setLoading(true);
        // setError(null);
        try {
          const response = await fetch(`/api/teams?page=1&limit=10`);
          const data = await response.json();
    
          console.log("API Response:", data);
          // setTeams(data.teams || []);
          // setTotalPages(data.totalPages);
          setTotalCount(data.totalCount); // ✅ Save the actual total
        } catch (err) {
          console.log(err);
          // setError((err as Error).message);
        } finally {
          // setLoading(false);
        }
      };
    
      fetchTeams();
    }, []);
    
    {/*teams api data end here */}

    {/**coaches api data */}
    useEffect(() => {
      const fetchCoaches = async () => {
        // setLoading(true);
        // setError(null);
        try {
          const response = await fetch(`/api/coachCount`);
          
          const data = await response.json();
    
          console.log("Coach Count:", data.coachCount[0].count); // ✅ Debugging line
          setCoaches(data.coachCount[0].count);

        } catch (err) {
          console.log("error",err);
          // setError((err as Error).message);
        } finally {
          // setLoading(false);
        }
      };
    
      fetchCoaches();
    }, []);
    {/**coaches api data end here */}

     {/**player api data */}

     useEffect(() => {
      const fetchplayers = async () => {
        // setLoading(true);
        // setError(null);
        try {
          const response = await fetch(`/api/playerCount`);
          
          const data = await response.json();
    
          console.log("Player Count:", data.playerCount[0].count); // ✅ Debugging line
          setPlayers(data.playerCount[0].count);

        } catch (err) {
          console.error('err',err);
          // setError((err as Error).message);
        } finally {
          // setLoading(false);
        }
      };
    
      fetchplayers();
    }, []);
    {/*player api data end here */}    

    {/**ORGANIZATION api data */}

    useEffect(() => {
      const fetchOrganizations = async () => {
        // setLoading(true);
        // setError(null);
        try {
          const response = await fetch(`/api/organizationCount`);
          
          const data = await response.json();
    
          console.log("Organization Count:", data.organizationCount[0].count); // ✅ Debugging line
          setOrganizations(data.organizationCount[0].count);

        } catch (err) {
          console.error("error", err);
          // setError((err as Error).message);
        } finally {
          // setLoading(false);
        }
      };
    
      fetchOrganizations();
    }, []);
    {/**ORGANIZATION api data end here */}

  return (
    <div className="flex justify-between grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-[1000px]">

      {/* <!-- Metric Item Start --> */}
      <div className=" flex rounded-2xl border border-gray-200 bg-sky-100 p-4 dark:border-gray-800 dark:bg-sky-900 md:p-6" >
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Coaches
            </span>
            <h4 className="mt-2 font-bold text-gray-700 text-xl dark:text-white/90">
            {coaches}
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
              Players
            </span>
            <h4 className="mt-2 font-bold text-gray-700 text-xl dark:text-white/90">
            {players}
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
              Organizations
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
             {totalCount}
            </h4>
          </div>
          
        </div>
      </div>
      
      {/* <!-- Metric Item End --> */}
    </div>
  );
};