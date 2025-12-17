// "use client";

// import { useEffect, useState } from "react";
// import Swal from "sweetalert2";
// import NotificationBell from "./NotificationBell";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// interface Notification {
//   ticketName: string;
//   messageId: number;
//   ticketId: number;
//   message: string;
//   ticketTitle: string;
// }

// interface TicketReply {
//   id: number;
//   message: string;
//   status: string;
//   filename: string | null;
//   repliedBy: string;
//   createdAt: string;
//   priority: string;
// }

// export default function NotificationDropdown() {
//   const [open, setOpen] = useState(false);
//   const [count, setCount] = useState(0);
//   const [notifications, setNotifications] = useState<Notification[]>([]);

//   // 🔥 Reply Modal State
//   const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
//   const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
//   const [ticketReplies, setTicketReplies] = useState<
//     (TicketReply & { parsedFiles: string[] })[]
//   >([]);
//   const [replyStatus, setReplyStatus] = useState("Pending");

//   // 🔔 Fetch notifications
//   const fetchNotifications = async () => {
//     const res = await fetch("/api/notifications");
//     const data = await res.json();
//     setNotifications(data.notifications || []);
//     setCount(data.notifications?.length || 0);
//   };

//   // ✅ Mark notification as read
//   const markOneAsRead = async (messageId: number) => {
//     await fetch("/api/notifications/mark-one", {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ messageId }),
//     });
//   };

//   // 🚀 SINGLE SOURCE OF TRUTH (Notification + Ticket Click)
//   const openReplyModal = async (
//     ticketId: number,
//     messageId?: number
//   ) => {
//     try {
//       // Mark notification read if exists
//       if (messageId) {
//         await markOneAsRead(messageId);
//         setNotifications(prev =>
//           prev.filter(n => n.messageId !== messageId)
//         );
//         setCount(prev => Math.max(prev - 1, 0));
//         setOpen(false);
//       }

//       setActiveTicketId(ticketId);
//       setIsReplyModalOpen(true);

//       // Fetch replies
//       const response = await fetch(
//         `/api/ticket/replies?ticketId=${ticketId}`
//       );
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Fetch failed: ${response.status} - ${errorText}`);
//       }

//       const data = await response.json();
//       if (!Array.isArray(data.replies)) {
//         throw new Error("Invalid response: replies not found");
//       }

//       // Parse attachments
//       const parsedReplies = data.replies.map(
//         (reply: TicketReply) => ({
//           ...reply,
//           parsedFiles: (() => {
//             try {
//               const parsed = JSON.parse(reply.filename || "[]");
//               return Array.isArray(parsed) ? parsed : [];
//             } catch {
//               return [];
//             }
//           })(),
//         })
//       );

//       setTicketReplies(parsedReplies);
//     } catch (error) {
//       console.error("Error loading replies:", error);
//       setTicketReplies([]);
//       Swal.fire("Error", "Could not load ticket messages.", "error");
//     }
//   };

//   // 🔔 Notification click
//   const handleNotificationClick = (n: Notification) => {
//     openReplyModal(n.ticketId, n.messageId);
//   };

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   return (
//     <div className="relative">
//       <NotificationBell count={count} onClick={() => setOpen(!open)} />

//       {open && (
//         <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900
//           border border-gray-200 dark:border-gray-700
//           rounded-lg shadow-lg z-50">
//           <div className="p-3 font-semibold border-b">
//             Notifications
//           </div>

//           {notifications.length === 0 ? (
//             <div className="p-4 text-sm text-gray-500">
//               No new notifications
//             </div>
//           ) : (
//             <ul className="max-h-72 overflow-y-auto">
//               {notifications.map((n) => (
//                 <li
//                   key={n.messageId}
//                   onClick={() => handleNotificationClick(n)}
//                   className="p-3 border-b text-sm cursor-pointer
//                     hover:bg-gray-100 dark:hover:bg-gray-800"
//                 >
//                   <p className="font-medium">
//                     {n.ticketName || `Ticket #${n.ticketId}`}
//                   </p>
//                   <p className="text-gray-500 line-clamp-2">
//                     {n.message}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       )}

//       {/* 🔥 REPLY DIALOG */}
//       <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
//         <DialogContent className="p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
//           <DialogTitle>Reply to Ticket</DialogTitle>

//           {/* Previous Messages */}
//           <div className="mt-4">
//             <h3 className="text-sm font-medium mb-2 text-blue-600">
//               Previous Messages
//             </h3>

//             <div className="border border-blue-300 rounded-md p-3 max-h-60 overflow-y-auto bg-gray-50 space-y-4 custom-scrollbar">
//               {ticketReplies.length === 0 ? (
//                 <p className="text-gray-400 text-sm">No messages yet.</p>
//               ) : (
//                 ticketReplies.map((reply) => (
//                   <div key={reply.id} className="border-b pb-3">
//                     <p className="text-sm text-gray-700">
//                       <span className="font-semibold">Message:</span>{" "}
//                       {reply.message}
//                     </p>

//                     <div className="text-xs text-gray-600 mt-1">
//                       {reply.repliedBy} —{" "}
//                       {new Date(reply.createdAt).toLocaleString()}
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Close */}
//           <div className="mt-6 flex justify-end">
//             <button
//               className="px-4 py-2 bg-red-500 text-white rounded-md"
//               onClick={() => setIsReplyModalOpen(false)}
//             >
//               Close
//             </button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import NotificationBell from "./NotificationBell";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Trash, Download, UploadCloud, Loader2 } from "lucide-react";
import Badge from "../ui/badge/Badge";
interface Notification {
    ticketName: string;
    messageId: number;
    ticketId: number;
    message: string;
    ticketTitle: string;
}

interface TicketReply {
    id: number;
    message: string;
    status: string;
    filename: string | null;
    repliedBy: string;
    createdAt: string;
    priority: string;
}
interface Admin {
    id: number;
    username: string;
    email: string;
    role: string;
}
export default function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const [count, setCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // 🔥 Dialog states
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
    const [ticketReplies, setTicketReplies] = useState<TicketReply[]>([]);

    // 📝 Reply states
    const [replyMessage, setReplyMessage] = useState("");
    const [replyStatus, setReplyStatus] = useState("Pending");
    const [replyPriority, setReplyPriority] = useState("Medium");
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🚨 Escalation
    const [isEscalate, setIsEscalate] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");
    const [selectedSubAdmin, setSelectedSubAdmin] = useState("");
    const [subAdmins, setSubAdmins] = useState<Admin[]>([]);

    // 🔔 Fetch notifications
    const fetchNotifications = async () => {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data.notifications || []);
        setCount(data.notifications?.length || 0);
    };
    useEffect(() => {
        const fetchSubAdmins = async () => {
            try {
                const response = await fetch(`/api/subadmin`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) throw new Error("Failed to fetch sub-admins");
                //console.log("response data add:",response.text());
                const contentType = response.headers.get("Content-Type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await response.text();
                    throw new Error(`Expected JSON, but got: ${text}`);
                }

                const data = await response.json();
                console.log("fetchsubadmins", data);
                setSubAdmins(data.admin);
            } catch (err) {
                console.error("Error fetching sub-admins:", err);
                setError((err as Error).message);
            }
        };
        fetchSubAdmins();
    }, []);
    // ✅ Mark notification read
    const markOneAsRead = async (messageId: number) => {
        await fetch("/api/notifications/mark-one", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messageId }),
        });
    };

    // 📩 Open modal + load replies
    const openReplyModal = async (ticketId: number, messageId?: number) => {
        try {
            if (messageId) {
                await markOneAsRead(messageId);
                setNotifications(prev => prev.filter(n => n.messageId !== messageId));
                setCount(prev => Math.max(prev - 1, 0));
                setOpen(false);
            }

            setActiveTicketId(ticketId);
            setIsReplyModalOpen(true);

            const res = await fetch(`/api/ticket/replies?ticketId=${ticketId}`);
            const data = await res.json();
            setTicketReplies(data.replies || []);
        } catch {
            Swal.fire("Error", "Failed to load ticket replies", "error");
        }
    };

    // 🗑 Delete reply
    const handleDeleteReply = async (replyId: number) => {
        const confirm = await Swal.fire({
            title: "Delete reply?",
            icon: "warning",
            showCancelButton: true,
        });

        if (!confirm.isConfirmed) return;

        await fetch(`/api/ticket/replies/${replyId}`, { method: "DELETE" });
        setTicketReplies(prev => prev.filter(r => r.id !== replyId));
    };

    // 🚀 Submit reply
    const handleReplySubmit = async () => {
        if (!replyMessage.trim()) {
            Swal.fire("Error", "Message is required", "error");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("ticketId", String(activeTicketId));
        formData.append("message", replyMessage);
        formData.append("status", replyStatus);
        formData.append("priority", replyPriority);
        if (attachmentFile) formData.append("file", attachmentFile);
        if (isEscalate) {
            formData.append("adminNotes", adminNotes);
            formData.append("subAdminId", selectedSubAdmin);
        }

        await fetch("/api/ticket/reply", {
            method: "POST",
            body: formData,
        });

        setReplyMessage("");
        setAttachmentFile(null);
        setIsEscalate(false);
        setLoading(false);

        openReplyModal(activeTicketId!);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (

        <div className="relative">
            <NotificationBell count={count} onClick={() => setOpen(!open)} />
            {error && <p className="text-center py-5 text-red-500">{error}</p>}

            {/* 🔔 DROPDOWN */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow z-50">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-xs text-gray-500">No new notifications</div>
                    ) : (
                            <div className="max-h-80 overflow-y-auto">

                        {notifications.map(n => (
                            <div
                                key={n.messageId}
                                onClick={() => openReplyModal(n.ticketId, n.messageId)}
                                className="p-3 border-b cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                            >
                                <p className="test-xs">{n.ticketName}</p>
                                {n.message && (
                                    <span className="ml-2 text-xs inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                                        {n.message.length}
                                    </span>
                                )}
                            </div>

                        ))}
                        </div>
                    )}
                </div>
            )}

            {/* 🔥 REPLY MODAL */}
            <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
                <DialogContent className="p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <DialogTitle>Reply to Ticket</DialogTitle>



                    {/* Previous Messages */}
                    <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2 text-blue-600">Previous Messages</h3>
                        <div className="border border-blue-300 rounded-md p-3 max-h-60 overflow-y-auto bg-gray-50 space-y-4 custom-scrollbar">
                            {ticketReplies.length === 0 ? (
                                <p className="text-gray-400 text-sm">No messages yet.</p>
                            ) : (
                                ticketReplies.map((reply) => (
                                    <div key={reply.id} className="border-b pb-3">

                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Message:</span> {reply.message}
                                            </p>
                                            <button
                                                onClick={() => handleDeleteReply(reply.id)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Delete reply"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-sm">Status:</span>
                                            <Badge
                                                color={
                                                    reply.status.toLowerCase() === "closed"
                                                        ? "error"
                                                        : reply.status.toLowerCase() === "open"
                                                            ? "info"
                                                            : reply.status.toLowerCase() === "fixed"
                                                                ? "success"
                                                                : reply.status.toLowerCase() === "pending"
                                                                    ? "warning"
                                                                    : "light"
                                                }
                                            >
                                                {reply.status}
                                            </Badge>
                                        </div>
                                        {/* Attachment from reply.filename */}
                                        {reply.filename && (
                                            <div className="flex items-center gap-2 text-sm mb-1">
                                                <span className="font-semibold text-sm">Attachment:</span>

                                                <a
                                                    href={reply.filename}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center hover:underline text-blue-500"
                                                >
                                                    <Download className="w-4 h-4 mr-1" />
                                                    Download
                                                </a>
                                            </div>
                                        )}


                                        <div className="text-sm text-gray-700">
                                            <span className="font-semibold">Date:</span> {reply.repliedBy} —{" "}
                                            {new Date(reply.createdAt).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            <span className="font-semibold">Prority:</span>  <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full
                          ${reply.priority === "High" ? "bg-red-100 text-red-700" : ""}
                          ${reply.priority === "Medium" ? "bg-yellow-100 text-yellow-700" : ""}
                          ${reply.priority === "Low" ? "bg-green-100 text-green-700" : ""}`}
                                            >
                                                {reply.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Message Box */}
                    <label className="block text-sm font-medium text-gray-700 mt-4">Message</label>
                    <textarea
                        className="w-full p-2 border rounded-md resize-none"
                        placeholder="Write your message..."
                        rows={2}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                    />

                    {/* Attachment Upload */}
                    <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
                        Attachment (Image or PDF)
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:border-blue-400 transition">
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <UploadCloud className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600">
                                Click or drag to upload file
                            </span>
                            {attachmentFile && (
                                <p className="text-xs text-green-600 font-medium">
                                    Selected: {attachmentFile.name}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="escalate"
                            checked={isEscalate}
                            onChange={(e) => setIsEscalate(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor="escalate" className="text-sm font-medium text-gray-700">
                            Escalate
                        </label>
                    </div>

                    {/* Show Notes + SubAdmin dropdown only if Escalate checked */}
                    {isEscalate && (
                        <div className="mt-4 space-y-4">
                            {/* Admin Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Admin Notes
                                </label>
                                <textarea
                                    className="w-full p-2 border rounded-md resize-none"
                                    rows={2}
                                    placeholder="Enter notes for escalation..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                />
                            </div>

                            {/* SubAdmin Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Escalate To
                                </label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={selectedSubAdmin}
                                    onChange={(e) => setSelectedSubAdmin(e.target.value)}
                                >
                                    <option value="">-- Select SubAdmin --</option>
                                    {subAdmins.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    {/* Status Dropdown */}
                    {/* <label className="block text-sm font-medium text-gray-700 mt-4">Status</label>
              <select
                className="w-full p-2 border rounded"
                value={replyStatus}
                onChange={(e) => setReplyStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Open">Open</option>
                <option value="Fixed">Fixed</option>
                <option value="Closed">Closed</option>
                <option value="Escalate">Escalate</option>
              </select> */}
                    {/* Status Dropdown */}
                    <div className="flex gap-4 mt-4">
                        {/* Status */}
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={replyStatus}
                                onChange={(e) => setReplyStatus(e.target.value)}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Open">Open</option>
                                <option value="Fixed">Fixed</option>
                                <option value="Closed">Closed</option>
                                <option value="Escalate">Escalate</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={replyPriority}
                                onChange={(e) => setReplyPriority(e.target.value)}
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>
                    {/* Buttons */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            className="px-4 py-2 bg-red-500 text-white rounded-md"
                            onClick={() => setIsReplyModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center justify-center"
                            onClick={handleReplySubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin text-blue-300 mr-2" size={16} />
                                    Submitting...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
