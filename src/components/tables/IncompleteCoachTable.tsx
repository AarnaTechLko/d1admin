"use client";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogTitle, DialogContent, DialogHeader } from "@/components/ui/dialog";
import axios from "axios";

import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
import { inCompleteCoach } from "@/app/types/types";
// import router from "next/router";
// import { useRouter } from "next/navigation";

interface CoachTableProps {
  data: inCompleteCoach[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}
interface ApiMessage {
  id: number;
  message: string;
  methods?: string[];
  created_at: string;
  sender_id?: string;
  from?: string;
}

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

const IncompleteCoachTable: React.FC<CoachTableProps> = ({ data = [], currentPage, totalPages, setCurrentPage }) => {
  // const [showConfirmation, setShowConfirmation] = useState(false);
  // const [confirmationCallback, setConfirmationCallback] = useState<() => void>(() => () => { });
  // const [ipOpen, setIpOpen] = useState<number | null>(null);
  // const [ipData, setIpData] = useState<{ ip: string; loginTime: string }[]>([]);
  // const itemsPerPage = 10;
  // const numberOfPages = Math.ceil(totalPages / itemsPerPage);

  // console.log("Total: ", numberOfPages);
  // console.log("Data: ", data)

  // const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // console.log("Paginated: ", paginatedData);

  // const [isCoachPasswordModalOpen, setCoachPasswordModalOpen] = useState(false);
  const [selectedCoachid, setSelectedCoachid] = useState<number | null>(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  // const [newCoachPassword, setNewCoachPassword] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);
  const [sendInternal, setSendInternal] = useState(false);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  const fetchRecentMessages = async (coachId: number) => {
  try {
    setIsMessagesLoading(true); // 🔄 START LOADING
    setRecentMessages([]);      // old messages clear

    const res = await axios.get("/api/messages", {
      params: { type: "coach", id: coachId },
    });

    const messages: ApiMessage[] = Array.isArray(res.data)
      ? res.data
      : res.data.messages || [];

    const formatted: RecentMessage[] = messages.map((msg) => ({
      id: msg.id,
      message: msg.message,
      methods: msg.methods ?? [],
      created_at: msg.created_at,
      position: "left",
      bgColor: "blue",
      sender_id: msg.sender_id ?? "",
      from: msg.from ?? "admin",
    }));

    setRecentMessages(formatted);
  } catch (error) {
    console.error("Failed to fetch messages", error);
    setRecentMessages([]);
  } finally {
    setIsMessagesLoading(false); // ✅ STOP LOADING
  }
};


 

  return (
    <div>
      <div className=" mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="w-full overflow-x-auto">
          <Table className="text-xs  min-w-[800px] sm:min-w-full">
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {["Coach"].map((header) => (
                  <TableCell key={header} className="px-4 py-2 sm:px-5 sm:py-3 text-gray-500 text-sm font-medium bg-gray-200 dark:text-gray-400">
                    {header}
                  </TableCell>
                ))}
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>
             

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((coach) => (
                <TableRow key={`${coach.id}`} className={"bg-white"}>
                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 dark:text-white/90">{coach.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex gap-2">
                      {/* {coach.is_deleted === 0 ? (
                        <button onClick={() => handleRevertCoach(coach.id)} className="text-red-600 text-sm">🛑</button>
                      ) : (
                        <button onClick={() => handleHideCoach(coach.id)} className="text-green-600 text-sm">👻</button>
                      )} */}
                      {/* 👁️ View IP Info button */}
                      {/* <Dialog open={ipOpen === Number(coach.id)} onOpenChange={() => setIpOpen(null)}>
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
                      </Dialog> */}

                      {/* <button
                        onClick={() => {
                          const changePassword = sessionStorage.getItem("change_password");

                          console.log("changepassword", changePassword);
                          if (changePassword === "1") {
                            handleOpenCoachModal(Number(coach.id));
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
                      </button> */}
                      {/* <button
                        onClick={() => setSelectedCoachid(Number(coach.id))}
                        title="Send Message"
                        className="text-purple-600 text-sm hover:underline"
                      >
                        💬
                      </button> */}

                      <button
                        className="text-purple-600"
                        onClick={() => {
                          setSelectedCoachid(Number(coach.id));
                          fetchRecentMessages(Number(coach.id));
                        }}
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
                                {coach.email}
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
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {isMessagesLoading ? (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></span>
                                Loading messages...
                              </div>
                            ) : recentMessages.length === 0 ? (
                              <p className="text-xs text-gray-500">No previous messages</p>
                            ) : (
                              recentMessages.map((msg) => (
                                <div
                                  key={msg.id}
                                  className={`p-2 rounded ${msg.bgColor === "green" ? "bg-green-100" : "bg-blue-100"
                                    }`}
                                >
                                  <p className="text-xs">{msg.message}</p>
                                  <p className="text-[10px] text-gray-500">
                                    {new Date(msg.created_at).toLocaleString()}
                                  </p>
                                </div>
                              ))
                            )}
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
                              disabled={isSending}
                              onClick={async () => {
                                if (isSending) return; // 🛑 double click guard

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
                                  setIsSending(true); // 🔒 LOCK BUTTON

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
                                  setIsSending(false); // 🔓 UNLOCK
                                }
                              }}
                              className={`px-4 py-2 rounded-lg text-white transition
    ${isSending
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >
                              {isSending ? "Sending..." : "Send"}
                            </button>
                          </div>
                        </DialogContent>

                      </Dialog>




                    </div>

                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end items-center gap-2 p-4 flex-wrap border-t">
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                disabled={page === currentPage}
                className={`px-3 py-1 rounded-md transition ${currentPage === page
                  ? "bg-blue-500 text-white cursor-not-allowed"
                  : "text-blue-500 hover:bg-gray-200"
                  }`}
              >
                {page}
              </button>
            );
          })}
        </div>
        {/* <div className="flex justify-end items-center gap-2 p-4 flex-wrap border-t border-gray-200 dark:border-white/[0.05]">
          {[...Array(totalPages)].map((_, index) => (
            <button key={index + 1} onClick={() => setCurrentPage(index + 1)} className={`px-3 py-1 rounded-md ${currentPage === index + 1 ? "bg-blue-500 text-white" : "text-blue-500 hover:bg-gray-200"}`}>{index + 1}</button>
          ))}
        </div> */}
      </div>
    </div >
  );
};

export default IncompleteCoachTable;