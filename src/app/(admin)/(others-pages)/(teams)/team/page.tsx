"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import {  Trash } from "lucide-react";
// import { useRouter } from "next/navigation";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Button from "@/components/ui/button/Button";

interface Team {
  id: string;
  team_name: string;
  logo: string;
  team_type: string;
  created_by: string;
  team_year: string;
  coach_id: string;
  totalPlayers: number;
  totalCoaches : number;
  club_id: string;
  status: string;
  organisation_name: string;
}

const TeamsPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [teams, setTeams] = useState<Team[]>([]);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // State for modal visibility
  const [showConfirmation, setShowConfirmation] = useState(false); // State for confirmation modal visibility
  const [confirmationCallback, setConfirmationCallback] = useState<() => void>(() => () => {}); // Callback for confirmation
  

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // const router = useRouter();


  const getBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "error";
      case "Pending":
        return "warning";
      default:
        return undefined;
    }
  };

  // Function to handle status change after confirmation
  const handleStatusChange = async () => {
    if (!selectedTeam) return;

    try {
      const response = await fetch("/api/teams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          newStatus: status,
        }),
      });

    if (!response.ok) throw new Error("Failed to update status");

      setOpen(false); // Close the popup after saving
      window.location.reload(); // Refresh the table to show updated status
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status. Please try again.");
    }
  };

  const confirmChange = () => {
    setShowConfirmation(true); // Show the confirmation dialog
    setConfirmationCallback(() => handleStatusChange); // Set the confirmation callback
  };



  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/teams?search=${searchQuery}&page=${currentPage}&limit=10`
        );

        if (!response.ok) throw new Error("Failed to fetch teams");

        const data = await response.json();

        console.log("Fetched teams data:", data);

        setTeams(data.teams);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [searchQuery, currentPage]);

  // Handle Edit Function


  // Handle Delete Function
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete team");

      // Remove deleted team from the UI
      setTeams((prevTeams) => prevTeams.filter((team) => team.id !== id));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Teams" onSearch={setSearchQuery} />

      {loading && <p className="text-center py-5">Loading...</p>}
      {error && <p className="text-center py-5 text-red-500">{error}</p>}

      {!loading && !error && (
        <>
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

         {/* Confirmation Dialog */}
      {showConfirmation && (
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="max-w-sm rounded-lg p-6 bg-white shadow-lg fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Confirm Status Change</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p>Are you sure you want to change the status to {status}?</p>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <Button
                onClick={() => {
                  setShowConfirmation(false); // Close the confirmation dialog
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
              >
                No
              </Button>
              <Button
                onClick={() => {
                  confirmationCallback(); // Proceed with the status change
                  setShowConfirmation(false); // Close the confirmation dialog
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Yes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}






        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {/* Team Count */}
          {/* <div className="p-4 text-gray-700 dark:text-gray-300">
            Total Teams: {teams.length}
          </div> */}

          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow className="bg-gray-100">
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Logo</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"> Name</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"> Player</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"> Coach</TableCell>
  
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Type</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Year</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Status</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="py-4 sm:px-1 text-start">
                    <div className="flex flex-col">
                      <div className="px-5">
                        <Image
                          src={team.logo}
                          alt={team.team_name}
                          className="w-12 h-12 rounded-full"
                          width={48}
                          height={48}
                        />
                      </div>
                      <div className="block font-medium text-gray-800 dark:text-white/90">
                        <span>{team.team_name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 ps-10">
                    {team.organisation_name || "No Organization"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{team.totalPlayers}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{team.totalCoaches }</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{team.team_type}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{team.team_year}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 background-overlay">
                      <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                          <button
                            onClick={() => { setSelectedTeam(team); setStatus(team.status); }}
                          >
                            <Badge color={getBadgeColor(team.status) ?? undefined} >
                              {team.status}
                            </Badge>
                          </button>
                        </DialogTrigger>

                        {selectedTeam
                         && (
                          <DialogContent className="max-w-sm rounded-lg p-6 bg-white shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 backdrop-blur-md ">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-semibold">Change Status</DialogTitle>
                            </DialogHeader>

                            {selectedTeam.status === "Pending" ? (
                              <p className="text-red-500">Pending status cannot be changed.</p>
                            ) : (
                              <div>
                                <select
                                  value={status ?? selectedTeam.status}
                                  onChange={(e) => setStatus(e.target.value)}
                                  className="w-full p-2 border rounded-md text-gray-700"
                                >
                                  <option value="Active">Active</option>
                                  <option value="Inactive">Inactive</option>
                                </select>

                                <div className="flex justify-center mt-4">
                                  <Button onClick={confirmChange} className="bg-blue-500  text-white px-4 py-2 rounded-md">
                                    Save
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        )}
                      </Dialog>
                    </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    <div className="flex gap-3">
                  
                      <button onClick={() => handleDelete(team.id)} className="p-2 text-red-500 hover:text-red-600">
                        <Trash size={18} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end items-center gap-2 p-4 border-t border-gray-200 dark:border-white/[0.05]">
  {/* Previous Button */}
  {/* <button
    onClick={() => setCurrentPage(currentPage - 1)}
    disabled={currentPage === 1}
    className={`px-4 py-2 rounded-lg text-blue-500 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:text-blue-600"}`}
  >
    Previous
  </button> */}

  {/* Numbered Pagination */}
  {[...Array(totalPages)].map((_, index) => {
    const pageNumber = index + 1;
    return (
      <button
        key={pageNumber}
        onClick={() => setCurrentPage(pageNumber)}
        className={`px-3 py-1 rounded-md ${
          currentPage === pageNumber
            ? "bg-blue-500 text-white"
            : "text-blue-500 hover:bg-gray-200"
        }`}
      >
        {pageNumber}
      </button>
    );
  })}

  {/* Next Button */}
  {/* <button
    onClick={() => setCurrentPage(currentPage + 1)}
    disabled={currentPage === totalPages}
    className={`px-4 py-2 rounded-lg text-blue-500 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:text-blue-600"}`}
  >
    Next
  </button> */}
</div>
        </div>
        </>
      )}
    </div>
  );
};

export default TeamsPage;