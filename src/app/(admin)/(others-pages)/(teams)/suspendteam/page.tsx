"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
// import { useRouter } from "next/navigation";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Button from "@/components/ui/button/Button";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useRoleGuard } from "@/hooks/useRoleGaurd";
interface Team {
  id: string;
  team_name: string;
  logo: string;
  team_type: string;
  created_by: string;
  team_year: string;
  coach_id: string;
  totalPlayers: number;
  totalCoaches: number;
  club_id: string;
  status: string;
  organisation_name: string;
  is_deleted: number;
  suspend: number;
  suspend_days: number;
}

const TeamsPage = () => {
        useRoleGuard();
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [teams, setTeams] = useState<Team[]>([]);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // State for modal visibility
  const [showConfirmation, setShowConfirmation] = useState(false); // State for confirmation modal visibility
  const [confirmationCallback, setConfirmationCallback] = useState<() => void>(() => () => { }); // Callback for confirmation

  const [teem, setTeem] = useState<{ teems: Team[] } | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const MySwal = withReactContent(Swal);
  // const router = useRouter();
  const [suspendTeam, setSuspendTeam] = useState<Team | null>(null);
  const [suspendDays, setSuspendDays] = useState<number | null>(null);
  const [suspendOpen, setSuspendOpen] = useState(false);

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
          `/api/suspendteam?search=${searchQuery}&page=${currentPage}&limit=10`
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

  async function handleHideTeam(teamId: string) {
    const confirmResult = await MySwal.fire({
      title: 'Are you sure?',
      text: 'This team will be marked as hidden.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, hide it!',
      cancelButtonText: 'Cancel',
    });

    if (!confirmResult.isConfirmed) return; // exit if canceled

    try {
      const res = await fetch(`/api/teams/hide/${teamId}`, {
        method: 'DELETE',
      });
      console.log("hide", teamId);

      if (!res.ok) throw new Error('Failed to hide team');

      setTeem((prev) => {
        if (!prev) return { teems: [] };

        const updatedTeams = prev.teems.map((team) =>
          team.id === teamId ? { ...team, is_deleted: 0 } : team
        );
        return { ...prev, teems: updatedTeams };
      });

      await MySwal.fire('Updated!', 'team hidden successfully.', 'success');

      window.location.reload();

    } catch (error) {
      console.error('Hide team error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to hide team',

      });
    }
  }

  async function handleRevertTeam(teamId: string) {
    const confirmResult = await MySwal.fire({
      title: 'Are you sure?',
      text: 'This will revert the team data.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, revert it!',
      cancelButtonText: 'Cancel',
    });

    if (!confirmResult.isConfirmed) return; // exit if canceled

    try {
      const res = await fetch(`/api/teams/revert/${teamId}`, {
        method: 'PATCH',
      });
      console.log("Revert", res);

      if (!res.ok) throw new Error('Failed to revert team');

      setTeem((prev) => {
        if (!prev) return { teems: [] };
        const updatedTeams = prev.teems.map((team) =>
          team.id === teamId ? { ...team, is_deleted: 1 } : team
        );
        return { ...prev, teems: updatedTeams };
      });

      await MySwal.fire('Updated!', 'team reverted successfully.', 'success');

      window.location.reload();

    } catch (error) {
      console.error('Revert team error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to revert team',
      });
    }
  }

//  if (loading) {
//         return <Loading />;
//     }


  return (
    <div>
      <PageBreadcrumb pageTitle="Teams" onSearch={setSearchQuery} />

      {loading && (
        <div className="flex items-center justify-center gap-4 ">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      )}      {error && <p className="text-center py-5 text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="flex justify-end items-center gap-2 p-2">
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
            {/* Team Count */}
            {/* <div className="p-4 text-gray-700 dark:text-gray-300">
            Total Teams: {teams.length}
          </div> */}

            <Table className="text-xs">
              <TableHeader className="border-b border-gray-100 bg-gray-200 text-sm dark:border-white/[0.05]">
                <TableRow className="bg-gray-100">
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Logo</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"> Name</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"> Player</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"> team</TableCell>

                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Type</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Year</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Status</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Suspend</TableCell>
                  <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">

                {teem?.teems.map((t) => (
                  <div key={t.id}>
                    <h3>{t.team_name}</h3>
                  </div>
                ))}

                {teams.map((team) => (
                  <TableRow
                    key={`${team.id}-${team.is_deleted}`} // include is_deleted to force re-render
                    className={team.is_deleted === 0 ? "bg-red-100" : "bg-white"}
                  >
                    <TableCell className="py-4 sm:px-1 text-start">
                      <div className="flex
                      items-center ">
                        <div className="px-5">
                          <Image
                            src={team.logo}
                            alt={team.team_name}
                            className=" rounded-full"
                            width={40}
                            height={40}
                          />
                        </div>
                        <div >
                          <span className="block font-medium text-gray-800 dark:text-white/90">{team.team_name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 ps-10">
                      {team.organisation_name || "No Team"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{team.totalPlayers}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{team.totalCoaches}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{team.team_type}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{team.team_year}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 background-overlay">
                      <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                          <button
                            onClick={() => { setSelectedTeam(team); setStatus(team.status); }}  >
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
                    <TableCell className="px-2 py-3">
                      <button
                        className="underline text-sm"
                        onClick={() => {
                          setSuspendTeam(team);
                          setSuspendOpen(true);
                        }}
                      >
                        <Badge
                          color={
                            (team.suspend === 1 || team.suspend_days === null)
                              ? "success"
                              : "error"
                          }
                        >
                          {(team.suspend === 1 || team.suspend_days === null)
                            ? "Unsuspend"
                            : "Suspend"}
                        </Badge>
                      </button>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <div className="flex gap-3">

                        {team.is_deleted === 0 ? (
                          <button
                            onClick={() => handleRevertTeam(team.id)}
                            title="Revert team"


                          >
                            🛑
                          </button>
                        ) : (
                          <button
                            onClick={() => handleHideTeam(team.id)}
                            title="Hide team"

                          >
                            👻
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end items-center gap-2 p-4 border-t border-gray-200 dark:border-white/[0.05]">

              {/* Numbered Pagination */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-1 rounded-md ${currentPage === pageNumber
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

              <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
                <DialogContent className="max-w-sm p-6 bg-white rounded-lg shadow-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {suspendTeam?.suspend === 1 ? "Unsuspend Team" : "Suspend Team"}
                    </DialogTitle>
                  </DialogHeader>

                  {suspendTeam && (
                    <div className="space-y-4">
                      {suspendTeam.suspend === 1 ? (
                        <>
                          {/* Show input when team is suspended */}
                          <p>
                            Suspend {suspendTeam.team_name}  for how many days?
                          </p>

                          <input
                            type="number"
                            min={1}
                            placeholder="Enter number of days"
                            value={suspendDays ?? ''}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setSuspendDays(isNaN(val) ? null : val);
                            }}
                            className="w-full p-2 border border-gray-300 rounded"
                          />

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSuspendOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              className="bg-red-500 text-white"
                              onClick={async () => {
                                if (!suspendTeam || suspendDays === null || suspendDays <= 0) {
                                  Swal.fire({
                                    icon: 'warning',
                                    title: 'Invalid Input',
                                    text: 'Please enter a valid number greater than 0.',
                                  });
                                  return;
                                }

                                try {
                                  const res = await fetch(`/api/teams/${suspendTeam.id}/suspend`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ suspend_days: suspendDays }),
                                  });

                                  const result = await res.json();
                                  if (!res.ok) throw new Error('Failed to suspend team');
                            console.log(result);

                                  Swal.fire({
                                    icon: 'success',
                                    title: 'Team Suspended',
                                    text: `${suspendTeam.team_name} suspended for ${suspendDays} day(s).`,
                                  });

                                  setSuspendOpen(false);
                                  setSuspendTeam(null);
                                  setSuspendDays(null);
                                  window.location.reload(); // Optional
                                } catch (err) {
                                  console.error("Suspension failed", err);
                                  Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: 'Could not suspend team. Please try again.',
                                  });
                                }
                              }}
                            >
                              Confirm Suspension
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Show only confirmation dialog when already active */}
                          <p>
                            Are you sure you want to unsuspend {suspendTeam.team_name} ?
                          </p>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSuspendOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              className="bg-green-600 text-white"
                              onClick={async () => {
                               setSuspendOpen(false);

                                const confirm = await Swal.fire({
                                  icon: 'question',
                                  title: 'Confirm Unsuspend',
                                  text: `Unsuspend ${suspendTeam.team_name}?`,
                                  showCancelButton: true,
                                  confirmButtonText: 'Yes, Unsuspend',
                                  cancelButtonText: 'Cancel',
                                });

                                if (!confirm.isConfirmed) return;

                                try {
                                  const res = await fetch(`/api/teams/${suspendTeam.id}/suspend`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ suspend_days: 0 }), // zero triggers unsuspend
                                  });

                                  const result = await res.json();
                                  if (!res.ok) throw new Error('Failed to unsuspend team');
                            console.log(result);

                                  Swal.fire({
                                    icon: 'success',
                                    title: 'Team Unsuspended',
                                    text: `${suspendTeam.team_name} has been unsuspended.`,
                                  });

                                  setSuspendOpen(false);
                                  setSuspendTeam(null);
                                  setSuspendDays(null);
                                  window.location.reload(); // Optional
                                } catch (err) {
                                  console.error("Unsuspension failed", err);
                                  Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: 'Could not unsuspend team. Please try again.',
                                  });
                                }
                              }}
                            >
                              Confirm Unsuspend
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TeamsPage;