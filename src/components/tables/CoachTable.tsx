"use client";
import React from "react";
import { Pencil, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { useState } from "react";

interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  gender: string;
  sport: string;
  totalEvaluations: string;
  status: string;
  earnings: number;
}

interface CoachTableProps {
  data: Coach[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}


const CoachTable: React.FC<CoachTableProps> = ({ data = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (coachId: string) => {
    console.log("Edit coach with ID:", coachId);
  };

  const handleDelete = async (coachId: string) => {
    if (!window.confirm("Are you sure you want to delete this coach?")) return;

    try {
      const response = await fetch(`/api/coach?id=${coachId}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete coach");
      }
      window.location.reload();
    } catch (error) {
      console.error("Error deleting coach:", error);
    }
  };

  // const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  // const paginatedData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <>
     {/* Pagination Controls (Top) */}
     <div className="flex justify-end items-center gap-2 p-2">
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
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Coach</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Gender</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Sport</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Earnings</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Evaluations</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Status</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedData.map((coach) => (
                  <TableRow key={coach.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                          <Image width={40} height={40} src={coach.image || "/images/signin/d1.png"} alt={`${coach.firstName} ${coach.lastName}`} />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 dark:text-white/90">{coach.firstName} {coach.lastName}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{coach.gender}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{coach.sport}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{coach.earnings || 0}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{coach.totalEvaluations || 0}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <Badge color={coach.status === "Active" ? "success" : coach.status === "Pending" ? "warning" : "error"}>{coach.status}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <div className="flex gap-3">
                        <button onClick={() => handleEdit(coach.id)} className="p-2 text-green-500 hover:text-green-600">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(coach.id)} className="p-2 text-red-500 hover:text-red-600">
                          <Trash size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end items-center gap-2 p-4 border-t border-gray-200 dark:border-white/[0.05]">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`px-3 py-1 rounded-md ${currentPage === pageNumber ? "bg-blue-500 text-white" : "text-blue-500 hover:bg-gray-200"}`}>{pageNumber}</button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoachTable;
