"use client";
import React, { useEffect, useState } from "react";
import { GroupIcon, TicketIcon } from "lucide-react"; // ✅ Added TicketIcon

<<<<<<< HEAD
interface Coach {
  id: string;
}
interface Player {
  id: string;
}
=======
import { GroupIcon } from "lucide-react";
// interface Coach {
//   id: string; 
// }
// interface player {
//   id: string;
// }
>>>>>>> 9fa82625346b11dced83d63b22e5d6ae3b9c374e
interface Organization {
  id: string;
}

export const EcommerceMetrics = () => {
<<<<<<< HEAD
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [ticketsCount, setTicketsCount] = useState<number>(0); // ✅ Tickets state
=======
    // const [teams, setTeams] = useState<Team[]>([]);
    // const [totalPages, setTotalPages] = useState<number>(1);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
     const [players, setPlayers] = useState<number>(0);
    const [coaches, setCoaches] = useState<number>(0);
    // const [error, setError] = useState<string | null>(null);
    // const [loading, setLoading] = useState<boolean>(true);
    // const router = useRouter();
>>>>>>> 9fa82625346b11dced83d63b22e5d6ae3b9c374e

  /** Teams API */
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`/api/teams?page=1&limit=10`);
        const data = await response.json();

<<<<<<< HEAD
        console.log("Teams API Response:", data);
        setTotalCount(data.totalCount || 0);
      } catch (err) {
        console.log(err);
      }
    };
=======
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
>>>>>>> 9fa82625346b11dced83d63b22e5d6ae3b9c374e

    fetchTeams();
  }, []);

  /** Coaches API */
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const id = "someId"; // replace with actual id
        const response = await fetch(`/api/coach?id=${id}`);
        const data = await response.json();

<<<<<<< HEAD
        console.log("Coaches API Response:", data);
        setCoaches(data.coaches || []);
      } catch (err) {
        console.log("error", err);
      }
    };
=======
     useEffect(() => {
      const fetchplayers = async () => {
        // setLoading(true);
        // setError(null);
        try {
          const response = await fetch(`/api/playerCount`);
          
          const data = await response.json();
    
          console.log("Player Count:", data.playerCount[0].count); // ✅ Debugging line
          setPlayers(data.playerCount[0].count);
>>>>>>> 9fa82625346b11dced83d63b22e5d6ae3b9c374e

    fetchCoaches();
  }, []);

  /** Players API */
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const id = "someId"; // replace with actual id
        const response = await fetch(`/api/player?id=${id}`);
        const data = await response.json();

<<<<<<< HEAD
        console.log("Players API Response:", data);
        setPlayers(data.player || []);
      } catch (err) {
        console.error("err", err);
      }
    };
=======
    useEffect(() => {
      const fetchOrganizations = async () => {
        // setLoading(true);
        // setError(null);
        try {
          const response = await fetch(`/api/organizationCount`);
          
          const data = await response.json();
    
          console.log("Organization Count:", data.organizationCount[0].count); // ✅ Debugging line
          setOrganizations(data.organizationCount[0].count);
>>>>>>> 9fa82625346b11dced83d63b22e5d6ae3b9c374e

    fetchPlayers();
  }, []);

  /** Organizations API */
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const id = "someId"; // replace with actual id
        const response = await fetch(`/api/organization?id=${id}`);
        const data = await response.json();

        console.log("Organizations API Response:", data);
        setOrganizations(data.enterprises || []);
      } catch (err) {
        console.error("error", err);
      }
    };

    fetchOrganizations();
  }, []);

  /** Tickets API */
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`/api/tickets?page=1&limit=1`); 
        const data = await response.json();

        console.log("Tickets API Response:", data);
        setTicketsCount(data.totalCount || 0); // ✅ Expect API to return totalCount
      } catch (err) {
        console.error("error", err);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="flex justify-between grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 w-[1000px]">
      {/* Coaches */}
      <div className="flex rounded-2xl border border-gray-200 bg-sky-100 p-4 dark:border-gray-800 dark:bg-sky-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Coaches
            </span>
            <h4 className="mt-2 font-bold text-gray-700 text-xl dark:text-white/90">
<<<<<<< HEAD
              {coaches.length}
=======
            {coaches}
>>>>>>> 9fa82625346b11dced83d63b22e5d6ae3b9c374e
            </h4>
          </div>
        </div>
      </div>

      {/* Players */}
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
<<<<<<< HEAD
              {players.length}
=======
            {players}
>>>>>>> 9fa82625346b11dced83d63b22e5d6ae3b9c374e
            </h4>
          </div>
        </div>
      </div>

      {/* Organizations */}
      <div className="rounded-2xl border border-gray-200 bg-red-100 p-4 dark:border-gray-800 dark:bg-sky-900 md:p-6">
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

      {/* Teams */}
      <div className="rounded-2xl border border-gray-200 bg-blue-200 p-4 dark:border-gray-800 dark:bg-sky-900 md:p-6">
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

      {/* Tickets */}
      <div className="rounded-2xl border border-gray-200 bg-yellow-200 p-4 dark:border-gray-800 dark:bg-sky-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <TicketIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Tickets
            </span>
            <h4 className="mt-2 font-bold text-gray-700 text-xl dark:text-white/90">
              {ticketsCount}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};
