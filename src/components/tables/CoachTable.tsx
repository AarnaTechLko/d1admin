"use client";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import Button from "../ui/button/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NEXT_PUBLIC_AWS_S3_BUCKET_LINK } from '@/lib/constants';
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Coach } from "@/app/types/types";
// import router from "next/router";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import { Eye, EyeOff, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
type RecentMessage = {
  sender_id: string;
  from: string;
  methods: string[];
  id: number;
  message: string;
  created_at: string;
  position: "left" | "right"; // for UI positioning
  bgColor: "green" | "blue";  // for background color
};
interface CoachTableProps {
  data: Coach[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const CoachTable: React.FC<CoachTableProps> = ({ data = [], currentPage,
  totalPages, setCurrentPage }) => {
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const MySwal = withReactContent(Swal);
  const [suspendCoach, setSuspendCoach] = useState<Coach | null>(null);
  const [suspendDays, setSuspendDays] = useState<number | null>(null);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [ipOpen, setIpOpen] = useState<number | null>(null);
  const [ipData, setIpData] = useState<{ ip: string; loginTime: string }[]>([]);
  const [loadingCoachId, setLoadingCoachId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [coaches, setCoaches] = useState<Coach[]>(data);
  const [percentageOpen, setPercentageOpen] = useState(false);
  const [tempPercentage, setTempPercentage] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isCoachPasswordModalOpen, setCoachPasswordModalOpen] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);
  const [selectedCoachid, setSelectedCoachid] = useState<number | null>(null);
  const [newCoachPassword, setNewCoachPassword] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);
  const [sendInternal, setSendInternal] = useState(false);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [sending, setSending] = useState(false);
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const handleOpenCoachModal = (coachId: number) => {
    setSelectedCoachId(coachId);
    setCoachPasswordModalOpen(true);
  };

  useEffect(() => {
    if (selectedCoachid) {
      (async () => {
        try {
          const res = await axios.get(`/api/messages?type=coach&id=${selectedCoachid}`);
          setRecentMessages(res.data.messages || []);
          console.log('Recent messages:', res.data.messages);
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      })();
    }
  }, [selectedCoachid]);

  useEffect(() => {
    setCoaches(data);
  }, [data]);

  const handleSavePercentage = async (id: string, tempPercentage: number) => {
    if (tempPercentage < 0 || tempPercentage > 20) {
      Swal.fire("Warning", "Percentage must be between 0 and 20.", "warning");
      return;
    }

    // Find the coach in state
    const coachToUpdate = coaches.find((coach) => coach.id === id);
    if (!coachToUpdate) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/coach/${id}/percentage`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ percentage: tempPercentage }),
      });

      if (!res.ok) {
        throw new Error("Failed to update percentage");
      }

      // Update frontend state
      setCoaches((prev) =>
        prev.map((coach) =>
          coach.id === id ? { ...coach, percentage: tempPercentage } : coach
        )
      );

      Swal.fire("Success", "Percentage updated successfully!", "success");
      window.location.reload();
      setPercentageOpen(false);
      setTempPercentage(0); // reset temporary input
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update percentage.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCoachModal = () => {
    setSelectedCoachId(null);
    setNewCoachPassword("");
    setCoachPasswordModalOpen(false);
    setIsSubmitting(false);
  };

  const handleFetchIpInfo = async (userId: number, type: 'player' | 'coach' | 'enterprise') => {
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

  const handleStatusChange = async () => {
    if (!selectedCoach) return;
    try {
      const response = await fetch("/api/coach", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachId: selectedCoach.id, newStatus: status }),
      });
      console.log('coach  data:', response);
      if (!response.ok) throw new Error("Failed to update status");
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status. Please try again.");
    }
  };



  // const confirmChange = () => {
  //   setShowConfirmation(true);
  //   setConfirmationCallback(() => handleStatusChange);
  // };

  async function handleHideCoach(coachId: string) {
    const confirmResult = await MySwal.fire({
      title: "Are you sure?",
      text: "This coach will be marked as hidden.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, hide it!",
      cancelButtonText: "Cancel",
    });
    if (!confirmResult.isConfirmed) return;
    try {
      const res = await fetch(`/api/coach/hide/${coachId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to hide coach");
      await MySwal.fire("Updated!", "Coach hidden successfully.", "success");
      window.location.reload();
    } catch (error) {
      console.error("Hide coach error:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to hide coach" });
    }
  }

  async function handleRevertCoach(coachId: string) {
    const confirmResult = await MySwal.fire({
      title: "Are you sure?",
      text: "This will revert the coach data.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, revert it!",
      cancelButtonText: "Cancel",
    });
    if (!confirmResult.isConfirmed) return;
    try {
      const res = await fetch(`/api/coach/revert/${coachId}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to revert coach");
      await MySwal.fire("Updated!", "Coach reverted successfully.", "success");
      window.location.reload();
    } catch (error) {
      console.error("Revert coach error:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to revert coach" });
    }
  }

  return (
    <div>
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


      <div className="mt-4 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="w-full overflow-x-auto max-h-[70vh] overflow-y-auto">
          <Table className="text-xs min-w-[800px] sm:min-w-full">
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell className="px-10 py-2 sm:px-5 sm:py-3 text-gray-500 text-sm font-medium bg-gray-200 dark:text-gray-400 w-48">
                  Coach
                </TableCell>
                <TableCell className="px-4 py-2 sm:px-5 sm:py-3 text-gray-500 text-sm font-medium bg-gray-200 dark:text-gray-400 w-24">
                  Gender
                </TableCell>
                <TableCell className="px-4 py-2 sm:px-5 sm:py-3 text-gray-500 text-sm font-medium bg-gray-200 dark:text-gray-400 w-24">
                  Sport
                </TableCell>
                <TableCell className="px-8 py-2 sm:px-5 sm:py-3 text-gray-500 text-sm font-medium bg-gray-200 dark:text-gray-400">
                  Earnings
                </TableCell>
                <TableCell className="px-8 py-2 sm:px-5 sm:py-3 text-gray-500 text-sm font-medium bg-gray-200 dark:text-gray-400">
                  Address
                </TableCell>
                <TableCell className="px-8 py-2 sm:px-5 sm:py-3 text-gray-500 text-sm font-medium bg-gray-200 dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell className="px-8 py-2 sm:px-5 sm:py-3 text-gray-500 text-sm font-medium bg-gray-200 dark:text-gray-400">
                  History
                </TableCell>
             
                <TableCell className="px-8 py-2 sm:px-5 sm:py-3 text-gray-500 text-sm font-medium bg-gray-200 dark:text-gray-400">
                  %
                </TableCell>
                <TableCell className="px-8 py-2 sm:px-5 sm:py-3 text-gray-500 text-sm font-medium bg-gray-200 dark:text-gray-400">
                  Actions
                </TableCell>
                <TableCell className="px-8 py-2 sm:px-5 sm:py-3 text-gray-500 text-sm font-medium bg-gray-200 dark:text-gray-400">
                  Timestamp
                </TableCell>
              </TableRow>

            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((coach) => (
                <TableRow key={`${coach.id}-${coach.is_deleted}`} className={coach.is_deleted === 0 ? "bg-red-100" : "bg-white"}>
                  <TableCell className="px-6 py-3 text-start">
                    <div className="flex items-center gap-3">
                      <Image
                        width={40}
                        height={40}
                        src={
                          !coach.image || coach.image === "null"
                            ? "/images/signin/d1.png"
                            : `${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${coach.image}`
                        }
                        alt={`${coach.firstName ?? "Coach"} ${coach.lastName ?? ""}`}
                        className="rounded-full"
                      />
                      <div className="flex items-center gap-1">
                        {coach.verified === 1 && (
                          <Image
                            src="/uploads/king_icon.png"
                            alt="Verified Crown"
                            width={18}
                            height={12}
                            className="inline-block"
                          />
                        )}
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {coach.firstName} {coach.lastName}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500">{coach.gender}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500">{coach.sport}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500">{coach.totalEvaluations || 0}</TableCell>
                  {/* <TableCell className="px-4 py-3 text-gray-500">{[coach.countryName, coach.state, coach.city].filter(Boolean).join(", ")}</TableCell> */}
                  <TableCell className="px-4 py-3 text-gray-500 max-w-[220px] break-words whitespace-normal">
                    <div className="leading-5">
                      {[coach.countryName, coach.state, coach.city].filter(Boolean).join(", ")}
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <button onClick={() => { setSelectedCoach(coach); setStatus(coach.status); }}>
                          <Badge color={getBadgeColor(coach.status) ?? undefined}>{coach.status}</Badge>
                        </button>
                      </DialogTrigger>
                      {selectedCoach && (
                        <DialogContent className="max-w-sm p-6 bg-white rounded-lg shadow-lg">
                          <DialogHeader><DialogTitle>Change Status</DialogTitle></DialogHeader>
                          {selectedCoach.status === "Pending" ? (
                            <p className="text-red-500">Pending status cannot be changed.</p>
                          ) : (
                            <div>
                              <select value={status ?? selectedCoach.status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 border rounded-md">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                              <div className="flex justify-center mt-4">
                                <Button onClick={handleStatusChange}
                                  className="bg-blue-500 text-white"> {loading ? "Saving..." : "Save"}</Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      )}
                    </Dialog>
                     <button
                      className="underline text-sm"
                      onClick={() => {
                        setSuspendCoach(coach);
                        setSuspendOpen(true);
                      }}
                    >
                      <Badge
                        color={
                          (coach.suspend === 1 || coach.suspend_days === null)
                            ? "info"
                            : "warning"
                        }
                      >
                        {(coach.suspend === 1 || coach.suspend_days === null)
                          ? "Suspend"
                          : "Unsuspend"}
                      </Badge>
                    </button>
                  </TableCell>
                  {/* <TableCell className="px-2 py-3">
                    <Link href={`/coach/${coach.id}`}><Button className="text-xs">Open</Button></Link>
                  </TableCell> */}

                  {/** palyer history */}

                  <TableCell className="px-2 py-3">
                    <Button
                      onClick={() => {
                        setLoadingCoachId(coach.id); // only this coach shows spinner
                        router.push(`/coach/${coach.id}`);
                      }}
                      title="Open History"
                      className="w-full flex items-center justify-center space-x-2 text-xs"
                      disabled={loadingCoachId === coach.id}
                    >
                      {loadingCoachId === coach.id && <FaSpinner className="animate-spin" />}
                      <span>{loadingCoachId === coach.id ? "Opening..." : "Open"}</span>
                    </Button>
                  </TableCell>




              

                  <TableCell className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        setSelectedCoach(coach); // store coach to state
                        setPercentageOpen(true);
                        setTempPercentage(coach.percentage ?? 0); // use existing percentage
                      }}
                      className={`w-full rounded px-2 py-1 ${(coach.percentage ?? 0) > 0 ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-200"
                        }`}>
                      {coach.percentage ?? 20}
                    </button>

                    {/* Modal / Dialog */}
                    {selectedCoach && selectedCoach.id === coach.id && (
                      <Dialog open={percentageOpen} onOpenChange={setPercentageOpen}>
                        <DialogContent className="max-w-sm p-6 bg-white rounded-lg shadow-lg">
                          <DialogHeader>
                            <DialogTitle>Update Percentage</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <input
                              type="number"
                              min={0}
                              max={20}
                              value={tempPercentage}
                              onChange={(e) => setTempPercentage(Number(e.target.value))}
                              className="w-full border rounded px-3 py-2"
                            />
                          </div>
                          <div className="flex justify-end gap-2 mt-4">
                            <Button
                              onClick={() => setPercentageOpen(false)}
                              className="bg-gray-300 text-black hover:bg-gray-400"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                // if (tempPercentage < 0 || tempPercentage > 20) {
                                if (tempPercentage < 0 || tempPercentage > 20 || isNaN(tempPercentage)) {

                                  toast.error("Please enter a value between 0 and 20", {
                                    duration: 2000,
                                    style: {
                                      background: "red",
                                      color: "white",
                                      minHeight: "50px",
                                      minWidth: "300px",
                                    },
                                  });

                                  // Close modal immediately after showing toast
                                  setPercentageOpen(false);
                                  return;
                                }

                                // Save percentage (update table state / API)
                                handleSavePercentage(coach.id, tempPercentage);
                                setPercentageOpen(false);
                              }}
                              className="bg-green-600 text-white hover:bg-green-700"
                            >
                              Save
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <div className="flex gap-2">
                      {coach.is_deleted === 0 ? (
                        <button onClick={() => handleRevertCoach(coach.id)}
                          className="text-red-600 text-sm"
                          title="Revert Coach"
                        ><RefreshCcw className="w-4 h-4 cursor-pointer" />
                        </button>
                      ) : (
                        <button onClick={() => handleHideCoach(coach.id)}
                          className="text-green-600 text-sm"
                          title="Hide Coach"
                        >👻</button>
                      )}
                      {/* 👁️ View IP Info button */}
                      <Dialog open={ipOpen === Number(coach.id)} onOpenChange={() => setIpOpen(null)}>
                        <DialogTrigger asChild>
                          <button
                            onClick={() => handleFetchIpInfo(Number(coach.id), 'coach')}
                            className="text-blue-600 text-sm hover:underline"
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
                              Recent IPs and login times for <span className="font-medium text-black">{coach.firstName} {coach.lastName}</span>
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
                          if (session?.user?.role?.toLowerCase() !== "admin") {
                            Swal.fire({
                              icon: "warning",
                              title: "Access Denied",
                              text: "You are not allowed to change the password.",
                            });
                            return;
                          }

                          handleOpenCoachModal(Number(coach.id));
                        }}
                        title="Change Password"
                        className="hover:text-blue-600"
                      >
                        🔒
                      </button>



                      <button
                        onClick={() => setSelectedCoachid(Number(coach.id))}
                        title="Send Message"
                        className="text-purple-600 text-sm hover:underline"
                      >
                        💬
                      </button>


                      <Dialog
                        open={selectedCoachid === Number(coach.id)}
                        onOpenChange={(isOpen) => {
                          if (!isOpen) {
                            setSelectedCoachid(null);
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
                                {coach.firstName} {coach.lastName}
                              </span>
                            </p>
                          </DialogHeader>

                          {/* Message Type Checkboxes */}
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

                          {/* Message Textarea */}
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
                            <div className="max-h-40 overflow-y-auto space-y-3">
                              {recentMessages.length === 0 ? (
                                <p className="text-xs text-gray-500">No previous messages</p>
                              ) : (
                                recentMessages.map((msg, idx) => {
                                  // Format methods nicely (if you want uppercase labels)
                                  const methodLabels = msg.methods.length
                                    ? msg.methods.map((m) => m.toUpperCase()).join(", ")
                                    : "N/A";

                                  // Set alignment and bg color
                                  const alignment =
                                    msg.position === "left" ? "justify-start" : "justify-end";
                                  const bgColor =
                                    msg.bgColor === "green" ? "bg-green-100" : "bg-blue-100";

                                  return (
                                    <div
                                      key={msg.id ?? idx}
                                      className={`flex ${alignment}`}
                                    >
                                      <div className={`p-3 rounded-xl shadow-sm ${bgColor} w-full`}>
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-xs font-semibold">
                                            From: {`${coach.firstName} ${coach.lastName}`}
                                          </span>
                                          <span className="text-[10px] text-gray-500">
                                            {new Date(msg.created_at).toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-700">
                                          <p>{msg.message}</p>
                                          <p className="text-gray-500">Methods: {methodLabels}</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              onClick={() => setSelectedCoachid(null)}
                              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                            <button
                              disabled={sending}
                              onClick={async () => {
                                if (sending) return; // 🛑 extra safety

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
                                  setSending(true); // ✅ START LOADING

                                  await axios.post(`/api/geolocation/coach`, {
                                    type: "coach",
                                    targetIds: [coach.id],
                                    message: messageText,
                                    methods: {
                                      email: sendEmail,
                                      sms: sendSMS,
                                      internal: sendInternal,
                                    },
                                  });

                                  Swal.fire("Success", "Message sent successfully!", "success");

                                  setSelectedCoachid(null);
                                  setMessageText("");
                                  setSendEmail(false);
                                  setSendSMS(false);
                                  setSendInternal(false);

                                } catch (err) {
                                  console.error(err);
                                  Swal.fire("Error", "Failed to send message.", "error");
                                } finally {
                                  setSending(false); // ✅ STOP LOADING
                                }
                              }}
                              className={`px-4 py-2 rounded-lg text-white
    ${sending ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
  `}
                            >
                              {sending ? "Sending..." : "Send"}
                            </button>

                          </div>
                        </DialogContent>

                      </Dialog>




                    </div>

                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500">
                    <div className="text-gray-500 dark:text-gray-400">
                      <div>{dayjs(coach.updated_at).format("DD.MM.YYYY hh:mm A")}</div>
                    </div>
                  </TableCell>


                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      
        <Dialog open={isCoachPasswordModalOpen} onOpenChange={setCoachPasswordModalOpen}>
          <DialogContent className="max-w-sm bg-white p-6 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Change Coach Password</DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newCoachPassword}
                  onChange={(e) => setNewCoachPassword(e.target.value)}
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
                  disabled={isSubmitting}
                  onClick={handleCloseCoachModal}
                  className="text-gray-600 hover:text-black disabled:opacity-50"
                >
                  Cancel
                </button>


                <button
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded text-white transition
    ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
  `}
                  onClick={async () => {
                    if (isSubmitting) return; // ⛔ double click stop

                    if (!newCoachPassword) {
                      Swal.fire("Warning", "Password is required", "warning");
                      return;
                    }

                    if (newCoachPassword.length < 6) {
                      Swal.fire("Warning", "Password must be at least 6 characters", "warning");
                      return;
                    }

                    try {
                      setIsSubmitting(true); // 🔄 START loading

                      const res = await fetch(
                        `/api/coach/${selectedCoachId}/change-password`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ newPassword: newCoachPassword }),
                        }
                      );

                      const data = await res.json();

                      if (!res.ok) throw new Error(data.error || "Failed");

                      Swal.fire("Success", "Password updated successfully", "success");

                      setNewCoachPassword("");
                      setCoachPasswordModalOpen(false);
                    } catch (err) {
                      console.error("Password updation failed", err);
                      Swal.fire("Error", "Failed to update Password. Try again.", "error");
                    } finally {
                      setIsSubmitting(false); // ✅ END loading
                    }
                  }}
                >
                  {isSubmitting ? "Assigning..." : "Assign Password"}
                </button>

              </div>
            </div>
          </DialogContent>
        </Dialog>


        <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
          <DialogContent className="max-w-sm p-6 bg-white rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle>
                {suspendCoach?.suspend === 1 ? "Suspend Coach" : "Unsuspend Coach"}
              </DialogTitle>
            </DialogHeader>

            {suspendCoach && (
              <div className="space-y-4">
                {suspendCoach.suspend === 1 ? (
                  <>
                    {/* Show input when coach is suspended */}
                    <p>
                      Suspend {suspendCoach.firstName} {suspendCoach.lastName} for how many days?
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
                          if (!suspendCoach || suspendDays === null || suspendDays <= 0) {
                            Swal.fire({
                              icon: 'warning',
                              title: 'Invalid Input',
                              text: 'Please enter a valid number greater than 0.',
                            });
                            return;
                          }

                          try {
                            const res = await fetch(`/api/coach/${suspendCoach.id}/suspend`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ suspend_days: suspendDays }),
                            });

                            const result = await res.json();
                            console.log("api ", result);
                            if (!res.ok) throw new Error('Failed to suspend coach');
                            console.log(result);
                            Swal.fire({
                              icon: 'success',
                              title: 'Coach Suspended',
                              text: `${suspendCoach.firstName} suspended for ${suspendDays} day(s).`,
                            });

                            setSuspendOpen(false);
                            setSuspendCoach(null);
                            setSuspendDays(null);
                            window.location.reload(); // Optional
                          } catch (err) {
                            console.error("Suspension failed", err);
                            Swal.fire({
                              icon: 'error',
                              title: 'Error',
                              text: 'Could not suspend coach. Please try again.',
                            });
                            setSuspendOpen(false);

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
                      Are you sure you want to unsuspend {suspendCoach.firstName} {suspendCoach.lastName}?
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
                            text: `Unsuspend ${suspendCoach.firstName}?`,
                            showCancelButton: true,
                            confirmButtonText: 'Yes, Unsuspend',
                            cancelButtonText: 'Cancel',
                          });

                          if (!confirm.isConfirmed) return;

                          try {
                            const res = await fetch(`/api/coach/${suspendCoach.id}/suspend`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ suspend_days: 0 }), // zero triggers unsuspend
                            });

                            const result = await res.json();
                            if (!res.ok) throw new Error('Failed to unsuspend coach');
                            console.log(result);

                            Swal.fire({
                              icon: 'success',
                              title: 'Coach Unsuspended',
                              text: `${suspendCoach.firstName} has been unsuspended.`,
                            });

                            setSuspendOpen(false);
                            setSuspendCoach(null);
                            setSuspendDays(null);
                            window.location.reload(); // Optional
                          } catch (err) {
                            console.error("Unsuspension failed", err);
                            Swal.fire({
                              icon: 'error',
                              title: 'Error',
                              text: 'Could not unsuspend coach. Please try again.',
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
  );
};

export default CoachTable;