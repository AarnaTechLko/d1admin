"use client";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
// import Badge from "../ui/badge/Badge";
import Image from "next/image";
import d1 from "@/public/images/signin/d1.png";
import Button from "../ui/button/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import Badge from "../ui/badge/Badge";
import { NEXT_PUBLIC_AWS_S3_BUCKET_LINK } from '@/lib/constants';

import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import AddRankingModal from "../AddRankingModal";
import dayjs from "dayjs";


interface Player {

    id: string;
    createdAt: number;
    updated_at: number;
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
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [open, setOpen] = useState(false); // State for modal visibility
    const [showConfirmation, setShowConfirmation] = useState(false); // State for confirmation modal visibility
    const itemsPerPage = 10;
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const [Player, setPlayer] = useState<{ players: Player[] } | null>(null);
    const [suspendPlayer, setSuspendPlayer] = useState<Player | null>(null);
    const [suspendDays, setSuspendDays] = useState<number | null>(null);
    const [suspendOpen, setSuspendOpen] = useState(false);
    const [loadingPlayerId, setLoadingPlayerId] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [newPlayerPassword, setNewPlayerPassword] = useState("");

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
    // const userRole = sessionStorage.getItem("role");;



    const handleClosePlayerModal = () => {
        setSelectedPlayerId(null);
        setNewPlayerPassword("");
        setPlayerPasswordModalOpen(false);
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
            console.log("response", response);
            if (!response.ok) throw new Error("Failed to update status");

            setOpen(false); // Close the popup after saving
            window.location.reload(); // Refresh the table to show updated status
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error updating status. Please try again.");
        }
    };

    // const confirmChange = () => {
    //   setShowConfirmation(true); // Show the confirmation dialog
    //   setConfirmationCallback(() => handleStatusChange); // Set the confirmation callback
    // };

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
                                <Table className="w-full text-xs">
                                    <TableHeader className="border-b text-xs w-full  bg-gray-200 border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell className="px-2 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
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
                                            <TableCell className="px-2 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                                                Timestamp
                                            </TableCell>

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
                                                <TableCell className=" py-4 px-1 text-start">
                                                    <div className="flex items-center gap-1">
                                                        <div className=" overflow-hidden ">
                                                            <Image
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full"
                                                                src={!player.image || player.image === "null" ? d1 : `${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${player.image}`}
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
                                                <TableCell className=" py-3 text-gray-500 dark:text-gray-400">{player.position}</TableCell>
                                                <TableCell className=" py-3 text-gray-500 dark:text-gray-400">{player.league}</TableCell>
                                                <TableCell className=" py-3 text-gray-500 dark:text-gray-400">{player.grade_level}</TableCell>
                                                <TableCell className=" py-3 text-gray-500 dark:text-gray-400">{player.age_group}</TableCell>
                                                <TableCell className="py-3 text-gray-500 dark:text-gray-400">{player.gender}</TableCell>
                                                <TableCell className="py-3 text-gray-500 dark:text-gray-400">{player.height}</TableCell>
                                                <TableCell className=" py-3 text-gray-500 dark:text-gray-400">{player.weight}</TableCell>
                                                <TableCell className=" py-3 text-gray-500 dark:text-gray-400">
                                                    {[player.countryName, player.state, player.city].filter(Boolean).join(", ")}
                                                </TableCell>



                                                {/* Clickable Status Badge */}
                                                <TableCell className=" py-3  text-gray-500 dark:text-gray-400 background-overlay">
                                                    <Dialog open={open} onOpenChange={setOpen}>
                                                        <DialogTrigger asChild>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedPlayer(player);
                                                                    setStatus(player.status);
                                                                }}
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
                                                                            <Button onClick={handleStatusChange} className="bg-blue-500  text-white px-4 py-2 rounded-md">
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
                                                <TableCell className="px-2 py-3">
                                                    <Button
                                                        onClick={() => {
                                                            setLoadingPlayerId(player.id); // ✅ only this row shows spinner
                                                            router.push(`/player/${player.id}`);
                                                        }}
                                                        title="Open History"
                                                        className="w-full flex items-center justify-center space-x-2 text-xs"
                                                        disabled={loadingPlayerId === player.id}
                                                    >
                                                        {loadingPlayerId === player.id && (
                                                            <FaSpinner className="animate-spin" />
                                                        )}
                                                        <span>
                                                            {loadingPlayerId === player.id ? "Opening..." : "Open"}
                                                        </span>
                                                    </Button>
                                                </TableCell>



                                                <TableCell className="px-2 py-3">
                                                    <button
                                                        className="underline text-xs"
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
                                                                ? "Suspend"
                                                                : "Unsuspend"}
                                                        </Badge>
                                                    </button>
                                                </TableCell>

                                                <TableCell>
                                                    <AddRankingModal
                                                        playerId={Number(player.id)}
                                                        onSuccess={() => {
                                                            console.log("Ranking added!");
                                                        }}
                                                    />
                                                </TableCell>


                                                <TableCell className=" py-3 text-gray-500 dark:text-gray-400">
                                                    <div>{dayjs(player.updated_at).format("D-MM-YYYY")}</div>
                                                    <div>{dayjs(player.updated_at).format("h:mm A")}</div>
                                                </TableCell>

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
                                <DialogTitle className="text-lg font-semibold">Change Coach Password</DialogTitle>
                            </DialogHeader>

                            <div className="mt-4 space-y-4">
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={newPlayerPassword}
                                        onChange={(e) => setNewPlayerPassword(e.target.value)}
                                        className="w-full border px-4 py-2 rounded pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={handleClosePlayerModal}
                                        className="text-gray-600 hover:text-black"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="bg-blue-600 text-white px-4 py-2 rounded"
                                        onClick={async () => {
                                            if (!newPlayerPassword) {
                                                Swal.fire("Warning", "Password is required", "warning");
                                                return;
                                            }
                                            if (newPlayerPassword.length < 6) {
                                                Swal.fire("Warning", "Password must be at least 6 characters", "warning");
                                                return;
                                            }

                                            try {
                                                const res = await fetch(`/api/player/${selectedPlayerId}/change-password`, {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ newPassword: newPlayerPassword }),
                                                });

                                                const data = await res.json();

                                                if (!res.ok) throw new Error(data.error || "Failed to update password");

                                                Swal.fire("Success", "Password updated successfully", "success");
                                                setNewPlayerPassword("");
                                                setPlayerPasswordModalOpen(false);
                                                setPlayer(data.player); // assuming your API returns { player: Player }

                                            } catch (err) {
                                                console.error("Password Updation failed", err);
                                                Swal.fire({
                                                    icon: 'error',
                                                    title: 'Error',
                                                    text: 'Could not update Password. Please try again.',
                                                });
                                            }
                                        }}
                                    >
                                        Assign Password
                                    </button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>



                    <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
                        <DialogContent className="max-w-sm p-6 bg-white rounded-lg shadow-lg">
                            <DialogHeader>
                                <DialogTitle>
                                    {suspendPlayer?.suspend === 1 ? "Suspend Player" : "Unsuspend Player"}
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
                                                        setSuspendOpen(false);

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