"use client";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
// import Badge from "../ui/badge/Badge";
import Image from "next/image";
import Button from "../ui/button/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import Badge from "../ui/badge/Badge";
import { NEXT_PUBLIC_AWS_S3_BUCKET_LINK } from '@/lib/constants';
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content';
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import dayjs from "dayjs";


type RecentMessage = {
  id: number;
  message: string;
  created_at: string;
};

interface Player {
  id: string;
  createdAt: number;
  updated_at: number;
  first_name: string;
  rank?: number | null;
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
  diamond: number;
  suspend_days: number;
}

interface PlayerTableProps {
  data: Player[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const PlayerTable: React.FC<PlayerTableProps> = ({ data = [],
  currentPage,
  totalPages,
  setCurrentPage
}) => {
  const MySwal = withReactContent(Swal);
  const router = useRouter();

  // const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // State for modal visibility
  const [showConfirmation, setShowConfirmation] = useState(false); // State for confirmation modal visibility
  const itemsPerPage = 10;
  const [ipOpen, setIpOpen] = useState<number | null>(null);
  const [ipData, setIpData] = useState<{ ip: string; loginTime: string }[]>([]);
  // const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const [Player, setPlayer] = useState<{ players: Player[] } | null>(null);
  const [suspendPlayer, setSuspendPlayer] = useState<Player | null>(null);
  const [suspendDays, setSuspendDays] = useState<number | null>(null);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);
  const [sendInternal, setSendInternal] = useState(false);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loadingPlayerId, setLoadingPlayerId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPlayerPassword, setNewPlayerPassword] = useState("");
  const { data: session } = useSession();
  const [isPlayerSubmitting, setIsPlayerSubmitting] = useState(false);


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
  const [selectedPlayerid, setSelectedPlayerid] = useState<number | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);


  useEffect(() => {
    if (selectedPlayerid) {
      (async () => {
        try {
          const res = await axios.get(`/api/messages?type=player&id=${selectedPlayerid}`);
          setRecentMessages(res.data.messages || []);
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      })();
    }
  }, [selectedPlayerid]);
  const handleOpenPlayerModal = (id: number) => {
    setSelectedPlayerId(id);
    setPlayerPasswordModalOpen(true);
  };

  const handleClosePlayerModal = () => {
    setSelectedPlayerId(null);
    setNewPlayerPassword("");
    setPlayerPasswordModalOpen(false);
    setIsPlayerSubmitting(false);
  };
  const handleFetchIpInfo = async (userId: number, type: 'player' | 'player' | 'enterprise') => {
    try {
      const res = await fetch(`/api/ip_logstab?userId=${userId}&type=${type}`);
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const result = await res.json();
      console.log("IP Log Response:", result);

      setIpData(result.data || []); // Set the IP data for dialog
      setIpOpen(userId);            // Open dialog for that user
    } catch (error) {
      console.error("Failed to fetch IP logs:", error);
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


      <div className=" rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
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
                      <TableCell className="px-2 py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                        Rank
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
                        Badges
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
                        <TableCell className="py-4 px-2 text-start">
                          <div className="flex items-center gap-3 min-w-0">

                            {/* Avatar */}
                            <Image
                              width={40}
                              height={40}
                              className="rounded-full flex-shrink-0"
                              src={
                                !player.image || player.image === "null"
                                  ? "/uploads/d1.png"
                                  : `${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${player.image}`
                              }
                              alt={`${player.first_name} ${player.last_name}`}
                            />

                            {/* Name + Badge */}
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                {player.diamond === 1 && (
                                  <Image
                                    src="/uploads/diamond.jpg"
                                    alt="Player Diamond"
                                    width={20}
                                    height={12}
                                    className="flex-shrink-0"
                                  />
                                )}
                                <span className="font-medium text-gray-800 dark:text-white/90 truncate">
                                  {player.first_name} {player.last_name}
                                </span>
                              </div>
                            </div>

                          </div>
                        </TableCell>
                        <TableCell className="py-3  text-gray-700 rounded">
                          <span className="inline-block px-3 py-1 text-white font-semibold text-sm rounded-full bg-green-600">
                            {player.rank || 0}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-gray-500 dark:text-gray-400 
                      whitespace-normal break-words">
                          {player.position}
                        </TableCell>
                        <TableCell className=" py-3 text-gray-500 dark:text-gray-400">{player.league}</TableCell>
                        <TableCell className=" py-3 text-gray-500 dark:text-gray-400 whitespace-normal break-words">{player.grade_level}</TableCell>
                        <TableCell className=" py-3 text-gray-500 dark:text-gray-400">{player.age_group}</TableCell>
                        <TableCell className="py-3 text-gray-500 dark:text-gray-400">{player.gender}</TableCell>
                        <TableCell className="py-3 text-gray-500 dark:text-gray-400">{player.height}</TableCell>
                        <TableCell className=" py-3 text-gray-500 dark:text-gray-400">{player.weight}</TableCell>
                        <TableCell className=" py-3 text-gray-500 dark:text-gray-400 whitespace-normal break-words">
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
                        <TableCell className="px-2 py-3">
                          <button
                            onClick={() => router.push(`/player/${player.id}/badges`)}
                            className="inline-flex items-center justify-center px-1 py-1 text-xs text-white rounded-full bg-green-600 hover:bg-green-700 transition"
                          >
                            View Badges
                          </button>

                        </TableCell>


                        <TableCell>
                          <div>
                            {player.is_deleted === 0 ? (
                              <button
                                onClick={async () => {
                                  await handleRevertPlayer(player.id);
                                }}
                                className=" text-white  px-1 py-1 rounded"
                              >
                                🛑
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  await handleHidePlayer(player.id);
                                }}
                                className=" text-white px-1 py-1 rounded"
                              >
                                👻
                              </button>
                            )}
                            {/* 👁️ View IP Info button */}
                            <Dialog open={ipOpen === Number(player.id)} onOpenChange={() => setIpOpen(null)}>
                              <DialogTrigger asChild>
                                <button
                                  onClick={() => handleFetchIpInfo(Number(player.id), 'player')}
                                  className="text-blue-600 text-xs hover:underline"
                                  title="View IP Logs"
                                >
                                  👁️
                                </button>

                              </DialogTrigger>

                              <DialogContent className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
                                <DialogHeader className="border-b pb-2">
                                  <DialogTitle className="text-lg font-semibold text-gray-800">
                                    IP Login Logs
                                  </DialogTitle>
                                  <p className="text-sm text-gray-500">
                                    Recent IPs and login times for <span className="font-medium text-black">{player.first_name} {player.last_name}</span>
                                  </p>
                                </DialogHeader>

                                {ipData && ipData.length > 0 ? (
                                  <>
                                    <div className="flex justify-between text-sm font-medium text-gray-700 border-b pb-1">
                                      <span>IP Address</span>
                                      <span>Login Time</span>
                                    </div>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                      {ipData.map((item, idx) => {
                                        const formattedTime = item.loginTime
                                          ? new Date(item.loginTime).toLocaleString("en-IN", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                          })
                                          : "N/A";

                                        return (
                                          <div
                                            key={idx}
                                            className="flex justify-between border-b border-gray-100 py-1 text-sm text-gray-800"
                                          >
                                            <span className="truncate max-w-[40%]">{item.ip}</span>
                                            <span className="text-right text-gray-600">{formattedTime}</span>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    <div className="pt-3 text-sm text-gray-500 text-right">
                                      Total logins: <span className="font-semibold text-black">{ipData.length}</span>
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-center text-sm text-gray-500">No IP logs found.</p>
                                )}
                              </DialogContent>
                            </Dialog>

                            <button
                              onClick={() => {
                                console.log("SESSION USER:", session?.user);

                                // ✅ ONLY admin can change password
                                if (session?.user?.role?.toLowerCase() === "admin") {
                                  handleOpenPlayerModal(Number(player.id));
                                } else {
                                  Swal.fire({
                                    icon: "warning",
                                    title: "Access Denied",
                                    text: "You are not allowed to change the password.",
                                  });
                                }
                              }}
                              title="Change Password"
                              className="hover:text-blue-600"
                            >
                              🔒
                            </button>

                            <button
                              onClick={() => setSelectedPlayerid(Number(player.id))}
                              title="Send Message"
                              className="text-purple-600 text-sm hover:underline"
                            >
                              💬
                            </button>

                            {/* Message Modal */}
                            <Dialog
                              open={selectedPlayerid === Number(player.id)}
                              onOpenChange={(isOpen) => {
                                if (!isOpen) {
                                  setSelectedPlayerid(null);
                                  setRecentMessages([]);
                                }
                              }}
                            >
                              <DialogContent className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
                                <DialogHeader className="border-b pb-2">
                                  <DialogTitle className="text-lg font-semibold text-gray-800">
                                    Send Message
                                  </DialogTitle>
                                  <p className="text-sm text-gray-500">
                                    Send a message to{" "}
                                    <span className="font-medium text-black">
                                      {player.first_name} {player.last_name}
                                    </span>
                                  </p>
                                </DialogHeader>

                                {/* ✅ Message Type Checkboxes */}
                                <div className="flex gap-4 text-sm">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={sendEmail}
                                      onChange={() => setSendEmail(!sendEmail)}
                                    />
                                    Email
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={sendSMS}
                                      onChange={() => setSendSMS(!sendSMS)}
                                    />
                                    SMS
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={sendInternal}
                                      onChange={() => setSendInternal(!sendInternal)}
                                    />
                                    Internal Message
                                  </label>
                                </div>

                                {/* ✅ Message Textarea */}
                                <textarea
                                  rows={5}
                                  value={messageText}
                                  onChange={(e) => setMessageText(e.target.value)}
                                  className="w-full border rounded-lg p-2 text-sm text-gray-800"
                                  placeholder="Enter your message..."
                                />

                                {/* Recent Messages */}
                                <div className="border-t pt-3">
                                  <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Messages</h3>
                                  <div className="max-h-32 overflow-y-auto space-y-2">
                                    {!Array.isArray(recentMessages) || recentMessages.length === 0 ? (
                                      <p className="text-xs text-gray-500">No previous messages</p>
                                    ) : (
                                      recentMessages.map((msg, idx) => (
                                        <div
                                          key={msg.id ?? idx}
                                          className="p-2 rounded-lg bg-gray-100 text-sm text-gray-800"
                                        >
                                          <p>{msg.message}</p>
                                          <span className="block text-xs text-gray-500">
                                            {msg.created_at ? new Date(msg.created_at).toLocaleString() : "—"}
                                          </span>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>


                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-2">
                                  <button
                                    onClick={() => setSelectedPlayerid(null)}
                                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    disabled={sendingMessage}
                                    onClick={async () => {
                                      if (sendingMessage) return;

                                      if (!messageText.trim()) {
                                        Swal.fire("Warning", "Please enter a message before sending.", "warning");
                                        return;
                                      }

                                      if (!sendEmail && !sendSMS && !sendInternal) {
                                        Swal.fire(
                                          "Warning",
                                          "Please select at least one method (Email, SMS, Internal).",
                                          "warning"
                                        );
                                        return;
                                      }

                                      try {
                                        setSendingMessage(true); // 🔒 lock button

                                        await axios.post(`/api/geolocation/player`, {
                                          type: "player",
                                          targetIds: [player.id],
                                          message: messageText,
                                          methods: {
                                            email: sendEmail,
                                            sms: sendSMS,
                                            internal: sendInternal,
                                          },
                                        });

                                        Swal.fire("Success", "Message sent successfully!", "success");

                                        setMessageText("");
                                        setSelectedPlayerid(null);

                                      } catch (err: unknown) {
                                        console.error("Failed to send message:", err);
                                        Swal.fire("Error", "Failed to send message.", "error");
                                      } finally {
                                        setSendingMessage(false); // 🔓 unlock button
                                      }
                                    }}
                                    className={`px-4 py-2 rounded-lg text-white flex items-center gap-2
    ${sendingMessage ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
  `}
                                  >
                                    {sendingMessage && <FaSpinner className="animate-spin" />}
                                    {sendingMessage ? "Sending..." : "Send"}
                                  </button>

                                </div>


                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500">
                          <div className="text-gray-500 dark:text-gray-400">
                            <div>{dayjs(player.updated_at).format("D-MM-YYYY")}</div>
                            <div>{dayjs(player.updated_at).format("h:mm A")}</div>
                          </div>                          </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}

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
                    disabled={isPlayerSubmitting}
                    onClick={handleClosePlayerModal}
                    className="text-gray-600 hover:text-black disabled:opacity-50"
                  >
                    Cancel
                  </button>


                  <button
                    disabled={isPlayerSubmitting}
                    className={`px-4 py-2 rounded text-white transition
    ${isPlayerSubmitting
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"}
  `}
                    onClick={async () => {
                      if (isPlayerSubmitting) return; // ⛔ double click stop

                      if (!newPlayerPassword) {
                        Swal.fire("Warning", "Password is required", "warning");
                        return;
                      }

                      if (newPlayerPassword.length < 6) {
                        Swal.fire("Warning", "Password must be at least 6 characters", "warning");
                        return;
                      }

                      try {
                        setIsPlayerSubmitting(true); // 🔄 loading ON

                        const res = await fetch(
                          `/api/player/${selectedPlayerId}/change-password`,
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ newPassword: newPlayerPassword }),
                          }
                        );

                        const data = await res.json();

                        if (!res.ok) throw new Error(data.error || "Failed");

                        Swal.fire("Success", "Password updated successfully", "success");

                        setNewPlayerPassword("");
                        setPlayerPasswordModalOpen(false);
                      } catch (err) {
                        console.error("Password updation failed", err);
                        Swal.fire("Error", "Failed to update Password. Try again.", "error");
                      } finally {
                        setIsPlayerSubmitting(false); // ✅ loading OFF
                      }
                    }}
                  >
                    {isPlayerSubmitting ? "Assigning..." : "Assign Password"}
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
                            } catch (err: unknown) {
                              console.error("Suspension failed:", err); // now it's used
                              Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Could not suspend player. Please try again.',
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
      </div >
    </>
  );
};

export default PlayerTable;