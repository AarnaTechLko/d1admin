"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
// import { useRouter } from "next/navigation";

interface Ticket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  assign_to:string;
  createdAt: string;
  status:string;
}

const TicketsPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // const router = useRouter();

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/ticket?search=${searchQuery}&page=${currentPage}&limit=10`);

        if (!response.ok) throw new Error("Failed to fetch tickets");

        const data = await response.json();
        setTickets(data.tickets);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [searchQuery, currentPage]);

  return (
    <div>

      <PageBreadcrumb pageTitle="Tickets" onSearch={setSearchQuery} />
      <div className="flex justify-end items-center gap-2 p-4 dark:border-white/[0.05]">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNumber ? "bg-blue-500 text-white" : "text-blue-500 hover:bg-gray-200"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

      {loading && <p className="text-center py-5">Loading...</p>}
      {error && <p className="text-center py-5 text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="p-4 text-gray-700 dark:text-gray-300">Total Tickets: {tickets.length}</div>

          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow className="bg-gray-100">
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Name</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Email</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Subject</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Message</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Assign to</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.name}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.email}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.subject}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.message}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.assign_to||0}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.status||"pending"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex justify-end items-center gap-2 p-4 border-t border-gray-200 dark:border-white/[0.05]">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNumber ? "bg-blue-500 text-white" : "text-blue-500 hover:bg-gray-200"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;