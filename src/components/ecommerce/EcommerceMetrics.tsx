"use client";
import React, { useEffect, useState } from "react";
import { GroupIcon, TicketIcon } from "lucide-react"; // ✅ Added TicketIcon

interface Coach {
  id: string;
}
interface Player {
  id: string;
}
interface Organization {
  id: string;
}

export const EcommerceMetrics = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [ticketsCount, setTicketsCount] = useState<number>(0); // ✅ Tickets state

  /** Teams API */
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`/api/teams?page=1&limit=10`);
        const data = await response.json();

        console.log("Teams API Response:", data);
        setTotalCount(data.totalCount || 0);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTeams();
  }, []);

  /** Coaches API */
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const id = "someId"; // replace with actual id
        const response = await fetch(`/api/coach?id=${id}`);
        const data = await response.json();

        console.log("Coaches API Response:", data);
        setCoaches(data.coaches || []);
      } catch (err) {
        console.log("error", err);
      }
    };

    fetchCoaches();
  }, []);

  /** Players API */
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const id = "someId"; // replace with actual id
        const response = await fetch(`/api/player?id=${id}`);
        const data = await response.json();

        console.log("Players API Response:", data);
        setPlayers(data.player || []);
      } catch (err) {
        console.error("err", err);
      }
    };

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
              {coaches.length}
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
              {players.length}
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
