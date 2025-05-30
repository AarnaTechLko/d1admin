"use client";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import Button from "../ui/button/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

interface Evaluation {
  id: string;
  evaluationId: number;
  player_id: string;
  playerSlug: string;
  playerFirstName: string;
  firstname: string;
  lastname: string;
  review_title: string;
  primary_video_link: string;
  jerseyNumber: string;
  jerseyColorOne: string;
  positionOne: string;
  status: number;
  turnaroundTime: number;
  payment_status: string;
  rating?: number;
  remarks?: string;
  created_at: string;
  is_deleted: number;
}
interface Coach {
  id: string;
  evaluationId: number;
  firstName: string;
  lastName: string;
  image: string;
  gender: string;
  sport: string;
  totalEvaluations: string;
  status: string;
  history?: string;
  earnings: number;
  evaluations: Evaluation[];
  is_deleted: number;


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
  const MySwal = withReactContent(Swal);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  //const [coach, setCoach] = useState<Coach | null>(null);
   const [coach, setCoach] = useState<{ coaches: Coach[] } | null>(null);



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
  async function handleHideCoach(coachId: string) {
  const confirmResult = await MySwal.fire({
    title: 'Are you sure?',
    text: 'This coach will be marked as hidden.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, hide it!',
    cancelButtonText: 'Cancel',
  });

  if (!confirmResult.isConfirmed) return; // exit if canceled

  try {
    const res = await fetch(`/api/coach/hide/${coachId}`, {
      method: 'DELETE',
    });
    console.log("hide", coachId);

    if (!res.ok) throw new Error('Failed to hide coach');

    setCoach((prev) => {
      if (!prev) return { coaches: [] };

      const updatedCoaches = prev.coaches.map((coach) =>
        coach.id === coachId ? { ...coach, is_deleted: 0 } : coach
      );
      return { ...prev, coaches: updatedCoaches };
    });

    await MySwal.fire('Updated!', 'Coach hidden successfully.', 'success');

    window.location.reload();

  } catch (error) {
    console.error('Hide coach error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to hide coach',
    });
  }
}

async function handleRevertCoach(coachId: string) {
  const confirmResult = await MySwal.fire({
    title: 'Are you sure?',
    text: 'This will revert the coach data.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, revert it!',
    cancelButtonText: 'Cancel',
  });

  if (!confirmResult.isConfirmed) return; // exit if canceled

  try {
    const res = await fetch(`/api/coach/revert/${coachId}`, {
      method: 'PATCH',
    });
    console.log("Revert", res);

    if (!res.ok) throw new Error('Failed to revert coach');

    setCoach((prev) => {
      if (!prev) return { coaches: [] };
      const updatedCoaches = prev.coaches.map((coach) =>
        coach.id === coachId ? { ...coach, is_deleted: 1 } : coach
      );
      return { ...prev, coaches: updatedCoaches };
    });

    await MySwal.fire('Updated!', 'Coach reverted successfully.', 'success');

    window.location.reload();

  } catch (error) {
    console.error('Revert coach error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to revert coach',
    });
  }
}
//  const [team, setTeam] = useState<{ teams: Team[] } | null>(null);


  return (
  <>
  {coach?.coaches.map((c) => (
  <div key={c.id} className="p-4 border">
  
  </div>
))}

  {/* Pagination Controls */}
  <div className="flex justify-end items-center gap-2 p-2 sm:p-3 md:p-4 flex-wrap">
    {[...Array(totalPages)].map((_, index) => {
      const pageNumber = index + 1;
      return (
        <button
          key={pageNumber}
          onClick={() => setCurrentPage(pageNumber)}
          className={`px-3 py-1 rounded-md text-sm sm:text-base ${currentPage === pageNumber
              ? "bg-blue-500 text-white"
              : "text-blue-500 hover:bg-gray-200"
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
            onClick={() => setShowConfirmation(false)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
          >
            No
          </Button>
          <Button
            onClick={() => {
              confirmationCallback();
              setShowConfirmation(false);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Yes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )}

  {/* Table Container */}
  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] sm:min-w-full">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {["Coach", "Gender", "Sport", "Earnings", "Evaluations", "Status", "History", "Actions"].map((header) => (
                <TableCell key={header} className="px-4 py-2 sm:px-5 sm:py-3 font-medium text-gray-500 text-start text-sm sm:text-base dark:text-gray-400">
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginatedData.map((coach) => (
              <TableRow
                key={`${coach.id}-${coach.is_deleted}`}
                className={coach.is_deleted === 0 ? "bg-red-100" : "bg-white"}
              >
                {/* Coach Info */}
                <TableCell className="px-4 py-3 sm:px-5 sm:py-4 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded-full">
                      <Image width={40} height={40} src={coach.image || "/images/signin/d1.png"} alt={`${coach.firstName} ${coach.lastName}`} />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 dark:text-white/90">{coach.firstName} {coach.lastName}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">{coach.gender}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">{coach.sport}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">{coach.earnings || 0}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">{coach.totalEvaluations || 0}</TableCell>

                {/* Status */}
                <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <button
                        onClick={() => { setSelectedCoach(coach); setStatus(coach.status); }}
                      >
                        <Badge color={getBadgeColor(coach.status) ?? undefined}>
                          {coach.status}
                        </Badge>
                      </button>
                    </DialogTrigger>

                    {selectedCoach && (
                      <DialogContent className="max-w-sm rounded-lg p-6 bg-white shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 backdrop-blur-md">
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
                              <Button onClick={confirmChange} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                Save
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    )}
                  </Dialog>
                </TableCell>

                {/* History */}
                <TableCell className="px-4 py-3">
                  <Link href={`/coach/${coach.id}`}>
                    <Button>Open</Button>
                  </Link>
                </TableCell>

                {/* Hide / Revert */}
                <TableCell className="px-4 py-3">
                  <div className="flex gap-2">
                    {coach.is_deleted === 0 ? (
                      <button
                        onClick={() => handleRevertCoach(coach.id)}
                        title="Revert Coach"
                        className="text-red-600 text-xl"
                      >
                        🛑
                      </button>
                    ) : (
                      <button
                        onClick={() => handleHideCoach(coach.id)}
                        title="Hide Coach"
                        className="text-green-600 text-xl"
                      >
                        ♻️
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>

    {/* Bottom Pagination Controls */}
    <div className="flex justify-end items-center gap-2 p-4 flex-wrap border-t border-gray-200 dark:border-white/[0.05]">
      {[...Array(totalPages)].map((_, index) => {
        const pageNumber = index + 1;
        return (
          <button
            key={pageNumber}
            onClick={() => setCurrentPage(pageNumber)}
            className={`px-3 py-1 rounded-md text-sm sm:text-base ${currentPage === pageNumber
                ? "bg-blue-500 text-white"
                : "text-blue-500 hover:bg-gray-200"
              }`}
          >
            {pageNumber}
          </button>
        );
      })}
    </div>
  </div>
</>

  );
};

export default CoachTable;