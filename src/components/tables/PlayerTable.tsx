"use client";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
// import Badge from "../ui/badge/Badge";
import Image from "next/image";
import d1 from "@/public/images/signin/d1.png";
import Button from "../ui/button/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import Badge from "../ui/badge/Badge";
import Link from "next/link";
import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content';

interface Player {

  id: string;
  first_name: string;
  last_name: string;
  image: string;
  position: string;
  league: string;
  height: string;
  jersey: string;
  weight: string;
  history?: string;
  graduation: string;
  sport: string;
  gender: string;
  countryName: string;
  state: string;
  city: string;
  status: string;
  earnings: number;
  age_group: string;
  grade_level: string;
  is_deleted: number;
  suspend: number;
  suspend_days: number;
}

interface PlayerTableProps {
  data: Player[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const PlayerTable: React.FC<PlayerTableProps> = ({ data = [],
  // currentPage = 1,
  // totalPages = 1,
  // setCurrentPage = () => { },
}) => {
  const MySwal = withReactContent(Swal);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // State for modal visibility
  const [showConfirmation, setShowConfirmation] = useState(false); // State for confirmation modal visibility
  const [confirmationCallback, setConfirmationCallback] = useState<() => void>(() => () => { }); // Callback for confirmation
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const [Player, setPlayer] = useState<{ players: Player[] } | null>(null);
  const [suspendPlayer, setSuspendPlayer] = useState<Player | null>(null);
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
  const [isPlayerPasswordModalOpen, setPlayerPasswordModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [newPlayerPassword, setNewPlayerPassword] = useState("");
  const userRole = sessionStorage.getItem("role");;

  const handleOpenPlayerModal = (id: number) => {
    setSelectedPlayerId(id);
    setPlayerPasswordModalOpen(true);
  };

  const handleClosePlayerModal = () => {
    setSelectedPlayerId(null);
    setNewPlayerPassword("");
    setPlayerPasswordModalOpen(false);
  };
  const handleChangePlayerPassword = async () => {
    if (!newPlayerPassword || newPlayerPassword.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Weak Password",
        text: "Password must be at least 6 characters.",
      }); return;
    }

    try {
      const res = await fetch(`/api/player/${selectedPlayerId}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newPlayerPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Player password updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
        handleClosePlayerModal();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.error || "Failed to change player password.",
        });
      }
    } catch (error) {
      console.error("Change player password error:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "An error occurred. Please try again.",
      });
    }
  };


  // Function to handle status change after confirmation
  const handleStatusChange = async () => {
    if (!selectedPlayer) return;

    try {
      const response = await fetch("/api/player", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: selectedPlayer.id,
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



  async function handleHidePlayer(playerId: string) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This player will be marked as hidden.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, hide it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return; // Stop if user cancels

    try {
      const res = await fetch(`/api/player/hide/${playerId}`, {
        method: 'DELETE',
      });
      console.log("hide", playerId);

      if (!res.ok) throw new Error('Failed to hide player');

      setPlayer((prev) => {
        if (!prev) return { players: [] };

        const updatedPlayers = prev.players.map((player) =>
          player.id === playerId ? { ...player, is_deleted: 0 } : player
        );
        return { ...prev, players: updatedPlayers };
      });

      await MySwal.fire('Updated!', 'player hide successfully.', 'success');


      window.location.reload();

    } catch (error) {
      console.error('Hide player error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to hide player',
      });
    }
  }

  async function handleRevertPlayer(playerId: string) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will restore the player.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, revert it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return; // Stop if user cancels
    try {
      const res = await fetch(`/api/player/revert/${playerId}`, {
        method: 'PATCH',
      });
      console.log("Revert", res);

      if (!res.ok) throw new Error('Failed to revert player');

      setPlayer((prev) => {
        if (!prev) return { players: [] };
        const updatedPlayers = prev.players.map((player) =>
          player.id === playerId ? { ...player, is_deleted: 1 } : player
        );
        return { ...prev, players: updatedPlayers };
      });

      await MySwal.fire('Updated!', 'Player reverted successfully .', 'success');

      window.location.reload();

    } catch (error) {
      console.error('Revert player error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to revert player',
      });
    }
  }




  return (
    <>
      {totalPages > 0 && (
        <div className="flex justify-end items-center gap-2 p-2">
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage?.(pageNumber)}
                className={`px-3 py-2 rounded-md ${currentPage === pageNumber
                  ? "bg-blue-500 text-white"
                  : "text-blue-500 hover:bg-gray-200"
                  }`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>
      )}



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


      <div className="overflow-x-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="w-full overflow-x-auto">
          <div>
            {data.length === 0 ? (
              <p className="p-6 text-gray-600">No Player found.</p>
            ) : (
              <>
                <Table className="min-w-full text-xs">
                  <TableHeader className="border-b text-xs  bg-gray-200 border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                        Player
                      </TableCell>
                      <TableCell className=" px-2 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                        Positions
                      </TableCell>
                      <TableCell className=" px-2 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                        League
                      </TableCell>
                      <TableCell className=" px-2 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                        Grade
                      </TableCell>
                      <TableCell className="px-2 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                        Age
                      </TableCell>
                      <TableCell className="px-2 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                        Gender
                      </TableCell>
                      <TableCell className="px-2 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                        Height
                      </TableCell>
                      <TableCell className="px-2 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                        Weight
                      </TableCell>
                      <TableCell className="px-2 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                        Address
                      </TableCell>
                      <TableCell className="px-2 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                        Status
                      </TableCell>
                      <TableCell className="px-2 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                        History
                      </TableCell>


                      <TableCell className="px-2 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                        Suspend
                      </TableCell>

                      <TableCell className="px-2 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                        Actions
                      </TableCell>
                      {userRole === "Customer Support" && (
                        <TableCell className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                          Change Password
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {Player?.players.map((p) => (
                      <div key={p.id}>
                        <h5>{p.first_name}</h5>
                      </div>
                    ))}
                    {paginatedData.map((player) => (

                      <TableRow
                        key={`${player.id}-${player.is_deleted}`} // include is_deleted to force re-render
                        className={player.is_deleted === 0 ? "bg-red-100" : "bg-white"}
                      >
                        <TableCell className=" py-4 sm:px-6 text-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 overflow-hidden ">
                              <Image
                                width={50}
                                height={50}
                                className="rounded-full"
                                src={player.image && player.image.startsWith("http") ? player.image : d1}
                                alt={`${player.first_name} ${player.last_name}`}
                                onError={(e) => (e.currentTarget.src = "/images/default-avatar.png")} // Fallback image
                              />

                            </div>
                            <div>
                              <span className="block font-medium text-gray-800 dark:text-white/90">
                                {player.first_name} {player.last_name}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{player.position}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{player.league}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{player.grade_level}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{player.age_group}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{player.gender}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{player.height}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{player.weight}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {[player.countryName, player.state, player.city].filter(Boolean).join(", ")}
                        </TableCell>



                        {/* Clickable Status Badge */}
                        <TableCell className="px-4 py-3  text-gray-500 dark:text-gray-400 background-overlay">
                          <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                              <button
                                onClick={() => { setSelectedPlayer(player); setStatus(player.status); }}
                              >
                                <Badge color={getBadgeColor(player.status) ?? undefined} >
                                  {player.status}
                                </Badge>
                              </button>
                            </DialogTrigger>

                            {selectedPlayer && (
                              <DialogContent className="max-w-sm rounded-lg p-6 bg-white shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 backdrop-blur-md ">
                                <DialogHeader>
                                  <DialogTitle className="text-lg font-semibold">Change Status</DialogTitle>
                                </DialogHeader>

                                {selectedPlayer.status === "Pending" ? (
                                  <p className="text-red-500">Pending status cannot be changed.</p>
                                ) : (
                                  <div>
                                    <select
                                      value={status ?? selectedPlayer.status}
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





                        {/** palyer history */}
                        <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">

                          <Link href={`/player/${player.id}`}>
                            <Button className="text-xs">Open</Button>
                          </Link>
                        </TableCell>

                        <TableCell className="px-2 py-3">
                          <button
                            className="underline text-sm"
                            onClick={() => {
                              setSuspendPlayer(player);
                              setSuspendOpen(true);
                            }}
                          >
                            <Badge
                              color={
                                (player.suspend === 1 || player.suspend_days === null)
                                  ? "success"
                                  : "error"
                              }
                            >
                              {(player.suspend === 1 || player.suspend_days === null)
                                ? "Unsuspend"
                                : "Suspend"}
                            </Badge>
                          </button>
                        </TableCell>


                        <TableCell>
                          <div>
                            {player.is_deleted === 0 ? (
                              <button
                                onClick={async () => {
                                  await handleRevertPlayer(player.id);
                                }}
                                className=" text-white px-4 py-1 rounded"
                              >
                                🛑
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  await handleHidePlayer(player.id);
                                }}
                                className=" text-white px-4 py-1 rounded"
                              >
                                ♻️
                              </button>
                            )}

                          </div>
                        </TableCell>
                        {userRole === "Customer Support" && (

                          <TableCell>
                            <button
                              onClick={() => handleOpenPlayerModal(Number(player.id))}
                              title="Change Password"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              🔒
                            </button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
            <div className="flex justify-end items-center gap-2 p-4 border-t border-gray-200 dark:border-white/[0.05]">

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
            </div>
          </div>
          <Dialog open={isPlayerPasswordModalOpen} onOpenChange={setPlayerPasswordModalOpen}>
            <DialogContent className="max-w-sm bg-white p-6 rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Change Player Password</DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPlayerPassword}
                  onChange={(e) => setNewPlayerPassword(e.target.value)}
                  className="w-full border px-4 py-2 rounded"
                />

                <div className="flex justify-end gap-2">
                  <button onClick={handleClosePlayerModal} className="text-gray-600 hover:text-black">Cancel</button>
                  <button onClick={handleChangePlayerPassword} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Update
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>


          <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
            <DialogContent className="max-w-sm p-6 bg-white rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle>
                  {suspendPlayer?.suspend === 1 ? "Unsuspend Player" : "Suspend Player"}
                </DialogTitle>
              </DialogHeader>

              {suspendPlayer && (
                <div className="space-y-4">
                  {suspendPlayer.suspend === 1 ? (
                    <>
                      {/* Show input when player is suspended */}
                      <p>
                        Suspend {suspendPlayer.first_name} {suspendPlayer.last_name} for how many days?
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
                            if (!suspendPlayer || suspendDays === null || suspendDays <= 0) {
                              Swal.fire({
                                icon: 'warning',
                                title: 'Invalid Input',
                                text: 'Please enter a valid number greater than 0.',
                              });
                              return;
                            }

                            try {
                              const res = await fetch(`/api/player/${suspendPlayer.id}/suspend`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ suspend_days: suspendDays }),
                              });

                              const result = await res.json();
                              if (!res.ok) throw new Error('Failed to suspend player');
                              console.log(result); // or use it in some logic

                              Swal.fire({
                                icon: 'success',
                                title: 'Player Suspended',
                                text: `${suspendPlayer.first_name} suspended for ${suspendDays} day(s).`,
                              });

                              setSuspendOpen(false);
                              setSuspendPlayer(null);
                              setSuspendDays(null);
                              window.location.reload(); // Optional
                            } catch (err) {
                              console.error("Suspension failed", err);
                              Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Could not suspend player. Please try again.',
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
                        Are you sure you want to unsuspend {suspendPlayer.first_name} {suspendPlayer.last_name}?
                      </p>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setSuspendOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-green-600 text-white"
                          onClick={async () => {
                            const confirm = await Swal.fire({
                              icon: 'question',
                              title: 'Confirm Unsuspend',
                              text: `Unsuspend ${suspendPlayer.first_name}?`,
                              showCancelButton: true,
                              confirmButtonText: 'Yes, Unsuspend',
                              cancelButtonText: 'Cancel',
                            });

                            if (!confirm.isConfirmed) return;

                            try {
                              const res = await fetch(`/api/player/${suspendPlayer.id}/suspend`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ suspend_days: 0 }), // zero triggers unsuspend
                              });

                              const result = await res.json();
                              if (!res.ok) throw new Error('Failed to unsuspend player');
                              console.log(result); // or use it in some logic

                              Swal.fire({
                                icon: 'success',
                                title: 'Player Unsuspended',
                                text: `${suspendPlayer.first_name} has been unsuspended.`,
                              });

                              setSuspendOpen(false);
                              setSuspendPlayer(null);
                              setSuspendDays(null);
                              window.location.reload(); // Optional
                            } catch (err) {
                              console.error("Unsuspension failed", err);
                              Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Could not unsuspend player. Please try again.',
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
  );
};

export default PlayerTable;