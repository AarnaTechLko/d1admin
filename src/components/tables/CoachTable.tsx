"use client";
import React, { useState } from "react";
import { Pencil, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import Button from "../ui/button/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";

interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  gender: string;
  sport: string;
  totalEvaluations: string;
  status: string;
  history?: string;
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
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // State for modal visibility
  const [showConfirmation, setShowConfirmation] = useState(false); // State for confirmation modal visibility
  const [confirmationCallback, setConfirmationCallback] = useState<() => void>(() => () => { }); // Callback for confirmation

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
      console.error("Error deleting coach :", error);
    }
  };

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
    if (!selectedCoach) return;

    try {
      const response = await fetch("/api/coach", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: selectedCoach.id,
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

  return (
    <>
      {/* Pagination Controls */}
      <div className="flex justify-end items-center gap-2 p-2 backdrop-blur-sm">
        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
              className={`px-3 py-1 rounded-md ${currentPage === pageNumber ? "bg-blue-500 text-white" : "text-blue-500 hover:bg-gray-200"
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
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">History</TableCell>
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

                    {/* Clickable Status Badge */}
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 background-overlay">
                      <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                          <button
                            onClick={() => { setSelectedCoach(coach); setStatus(coach.status); }}
                          >
                            <Badge color={getBadgeColor(coach.status) ?? undefined} >
                              {coach.status}
                            </Badge>
                          </button>
                        </DialogTrigger>

                        {selectedCoach && (
                          <DialogContent className="max-w-sm rounded-lg p-6 bg-white shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 backdrop-blur-md ">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-semibold">Change Status</DialogTitle>
                            </DialogHeader>

                            {selectedCoach.status === "Pending" ? (
                              <p className="text-red-500">Pending status cannot be changed.</p>
                            ) : (
                              <div>
                                <select
                                  value={status ?? selectedCoach.status}
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

                    {/** coaches history */}
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <Link href={`/coach/${coach.id}`}>
                        <Button>Open</Button>
                      </Link>
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