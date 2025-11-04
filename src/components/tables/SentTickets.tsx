"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogTitle, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Download, MessageSquare, StickyNote, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
// import Loading from "@/components/Loading";
// import { useSession } from 'next-auth/react';
import { UploadCloud } from "lucide-react";
import { useRoleGuard } from "@/hooks/useRoleGaurd";
import toast from "react-hot-toast";
import dayjs from "dayjs";


type TicketNote = {
  id: number;
  ticketId: number;
  notes: string;
  createdAt: string;
};

interface Ticket {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  escalate: boolean;
  assign_to: number;
  assign_to_username: string;
  createdAt: string;
  status: string;
  assignee_name: string;
  priority: string;

}
interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
}
interface TicketReply {
  filename: string;
  id: number;
  ticketId: number;
  message: string;
  status: string;
  repliedBy: string;
  createdAt: string;
  fullAttachmentUrl?: string;
  priority: string;
  parsedFiles?: string[];
}

const TicketsPage = () => {
  useRoleGuard();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusQuery, setStatusQuery] = useState<string>("");
  const [sentTickets, setSentTickets] = useState<Ticket[]>([]);
  const [daysQuery, setDaysQuery] = useState<string>("");

  const [replyPriority, setReplyPriority] = useState<string>("Medium");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subAdmins, setSubAdmins] = useState<Admin[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [replyStatus, setReplyStatus] = useState<string>("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const [ticketReplies, setTicketReplies] = useState<TicketReply[]>([]);
  const [isEscalate, setIsEscalate] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedSubAdmin, setSelectedSubAdmin] = useState("");
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notes, setNotes] = useState<TicketNote[]>([]);
  // Fetch all sub-admins when modal opens

  const handleReplyClick = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setReplyStatus(ticket.status);
    setIsReplyModalOpen(true);

    try {
      const response = await fetch(`/api/ticket/replies?ticketId=${ticket.id}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fetch failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("images dataL", data);
      if (!data.replies || !Array.isArray(data.replies)) {
        throw new Error("Invalid response: replies not found");
      }

      // Parse filenames in each reply (if available)
      const parsedReplies = data.replies.map((
        reply: TicketReply): TicketReply & { parsedFiles: string[] } => ({
          ...reply,
          parsedFiles: (() => {
            try {
              const parsed = JSON.parse(reply.filename || '[]');
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })(),
        }));

      setTicketReplies(parsedReplies);
    } catch (error) {
      console.error("Error fetching replies:", error);
      setTicketReplies([]);
      Swal.fire("Error", "Could not load ticket messages.", "error");
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedTicket) {
      Swal.fire("Error", "No ticket selected.", "error");
      return;
    }

    if (!replyMessage.trim()) {
  toast.error("Message cannot be empty.", {
    duration: 4000,
    position: "top-right",
    style: {
      background: "red",       // background color
      color: "white",          // text color
      minWidth: "300px",       // width of the toast
      minHeight: "60px",       // height of the toast
     
    },
  });
  return;
}

    setLoading(true);

    try {
      // 1️⃣ Prepare form data for reply API
      const formData = new FormData();
      formData.append("ticketId", String(selectedTicket.id));
      formData.append("repliedBy", userId ?? "");
      formData.append("message", replyMessage.trim());
      formData.append("status", replyStatus);
      formData.append("priority", replyPriority);
      formData.append("escalate", isEscalate ? "true" : "false");

      if (attachmentFile) {
        formData.append("attachment", attachmentFile);
      }

      // 2️⃣ Send reply to backend
      const response = await fetch("/api/ticket/reply", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        Swal.fire("Error", data.error || "Failed to send reply.", "error");
        return;
      }

      // 3️⃣ Update ticket in frontend list
      setSentTickets((prevTickets) =>
        prevTickets.map((t) =>
          t.id === selectedTicket.id
            ? {
              ...t,
              status: replyStatus,
              message: replyMessage.trim(),
              priority: replyPriority,
              escalate: isEscalate, // ✅ update escalation flag
            }
            : t
        )
      );

      // 4️⃣ Save internal note (if provided)
      if (adminNotes?.trim()) {
        try {
          const noteResponse = await fetch("/api/ticket-notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ticketId: selectedTicket.id,
              notes: adminNotes.trim(),
            }),
          });

          if (!noteResponse.ok) {
            const noteData = await noteResponse.json();
            console.error("Error saving note:", noteData.error);
          } else {
            setAdminNotes("");
          }
        } catch (noteError) {
          console.error("Failed to save note:", noteError);
        }
      }

      // 5️⃣ Handle escalation assignment (only if checked)
      if (isEscalate && selectedSubAdmin) {
        try {
          const assignResponse = await fetch("/api/ticket-assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ticketId: selectedTicket.id,
              fromId: userId,
              toId: selectedSubAdmin,
              escalate: true,
            }),
          });

          const assignData = await assignResponse.json();
          if (!assignResponse.ok) {
            Swal.fire("Error", assignData.error || "Failed to assign ticket.", "error");
          } else {
            console.log("Ticket escalated successfully:", assignData.data);
          }
        } catch (assignError) {
          console.error("Failed to assign ticket:", assignError);
          Swal.fire("Error", "Failed to assign ticket.", "error");
        }
      }

      // 6️⃣ Success feedback and cleanup
      Swal.fire("Success", "Reply, note, and escalation saved successfully!", "success");

      setReplyMessage("");
      setAttachmentFile(null);
      setIsEscalate(false);
      setAdminNotes("");
      setSelectedSubAdmin("");
      setIsReplyModalOpen(false);
    } catch (error) {
      console.error("Error submitting ticket reply:", error);
      Swal.fire("Error", "An unexpected error occurred while sending reply.", "error");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id") || sessionStorage.getItem("user_id");
    if (!storedUserId) {
      router.push("/signin");
    } else {
      setUserId(storedUserId);
    }
  }, [router]);

  // ✅ Fetch tickets when userId, searchQuery, statusQuery, or currentPage changes
  useEffect(() => {
    if (!userId) return;

    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/tickets/sent?userId=${userId}&search=${searchQuery}&status=${statusQuery}&days=${daysQuery}`
        );

        if (!response.ok) throw new Error("Failed to fetch tickets");

        const data = await response.json();
        console.log("daatasent", data);

        setSentTickets(data.sent ?? [])
        setTotalPages(data.totalPages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userId, searchQuery, currentPage, statusQuery, daysQuery]);

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

  const handleAssignToClick = (ticket: Ticket) => {
    // If already assigned, don't open the modal
    if (ticket.assign_to) {
      Swal.fire('Already Assigned', 'This ticket has already been assigned to a sub-admin.', 'info');
      return;
    }

    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleAssignSubAdmin = async (subAdmin: Admin) => {
    if (!selectedTicket) return;
    setIsSubmitting(true);


    try {
      const response = await fetch(`/api/ticket/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket?.id, assignTo: subAdmin.id }),
      });

      // Log the response status and content
      console.log("Response Status:", response.status);

      const contentType = response.headers.get("Content-Type");
      console.log("Response Content-Type:", contentType);

      if (!response.ok) {
        const errorData = await response.json(); // Assuming the API returns a JSON error message
        console.error("API Error Response:", errorData);
        throw new Error(`Failed to assign sub-admin: ${errorData?.error || "Unknown error"}`);
      }

      // Check if the response is JSON
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text(); // Read the response as text if not JSON
        console.error("Non-JSON Response:", text);
        throw new Error(`Expected JSON, but got: ${text}`);
      }

      // const data = await response.json();
      setSentTickets((prevTickets) =>
        prevTickets.map((t) => (t.id === selectedTicket.id ? {
          ...t, assign_to: subAdmin.id, assign_to_username: subAdmin.username
        } : t))
      );



      setIsModalOpen(false); // Close modal after assigning sub-admin
    } catch (err) {
      console.error("Error assigning sub-admin:", err);
      setError((err as Error).message); // Set the error state
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleViewNotesClick = async (ticket: Ticket) => {
    setIsNotesOpen(true);

    try {
      const res = await fetch(`/api/ticket-notes/${ticket.id}`);
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
      setNotes([]);
    } finally {
    }
  };

  const handleModalSubmit = async () => {
    if (!selectedTicket) {
      setError("No ticket selected");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No ticket selected.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the selected sub-admin object
      const assignedSubAdmin = subAdmins.find(
        (admin) => admin.id === selectedTicket.assign_to
      );

      if (assignedSubAdmin) {
        await handleAssignSubAdmin(assignedSubAdmin); // ✅ Call API function

        Swal.fire({
          icon: "success",
          title: "Assigned!",
          text: `${assignedSubAdmin.username} has been assigned successfully.`,
          timer: 2000,
          showConfirmButton: false,
        });

        setIsModalOpen(false); // close modal on success
        window.location.reload();

      } else {
        setError("Please select a sub-admin before submitting.");
        Swal.fire({
          icon: "warning",
          title: "No Sub-Admin Selected",
          text: "Please select a sub-admin before submitting.",
        });
      }
    } catch (error) {
      console.error("Assignment failed:", error);
      Swal.fire({
        icon: "error",
        title: "Assignment Failed",
        text: "Something went wrong while assigning sub-admin.",
      });
    } finally {
      setIsSubmitting(false);
    }

  };

  const handleDeleteReply = async (replyId: number) => {
    setIsReplyModalOpen(false);

    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the message permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmed.isConfirmed) {
      try {
        const res = await fetch(`/api/ticket/reply?id=${replyId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          Swal.fire("Deleted!", "The reply has been removed.", "success");
          setTicketReplies((prev) => prev.filter((r) => r.id !== replyId));
        } else {
          Swal.fire("Error", "Failed to delete reply.", "error");
        }
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire("Error", "Something went wrong.", "error");
      }
    }
  };
  // if (loading) {
  //   return <Loading />;
  // }

  return (
    <div>

      {/* <div className="p-4">
        {userId && (
          <p className="mt-2 text-gray-600">Logged in as Admin ID: <strong>{userId}</strong></p>
        )}
      </div> */}

      <PageBreadcrumb pageTitle="Sent Ticket" onStatus={setStatusQuery} onSearch={setSearchQuery} onDays={setDaysQuery} />
      <div className="flex justify-end items-center gap-2 p-4 dark:border-white/[0.05]">
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

      {loading && <p className="text-center py-5">Loading...</p>}
      {error && <p className="text-center py-5 text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {/* <div className="p-4 text-gray-700 dark:text-gray-300">Total Tickets: {tickets.length}</div> */}
          <Table className="text-xs">
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow className="bg-gray-100">
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Name</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Email</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Subject</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Message</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Priority</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Assign To</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Status</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Actions</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Timestamp</TableCell>

              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">

              {Array.isArray(sentTickets) && sentTickets.length > 0 ? (
                sentTickets.map((ticket) => (
                  // <TableRow key={ticket.id}>

                  <TableRow
                    key={ticket.id}
                    className={ticket.escalate ? "bg-red-100 dark:bg-red-900/20" : ""}
                  >
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.name}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.email}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.subject}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.message}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full
                          ${ticket.priority === "High" ? "bg-red-100 text-red-700" : ""}
                          ${ticket.priority === "Medium" ? "bg-yellow-100 text-yellow-700" : ""}
                          ${ticket.priority === "Low" ? "bg-green-100 text-green-700" : ""}`}
                      >
                        {ticket.priority}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => handleAssignToClick(ticket)}
                      >

                        {ticket.assign_to_username || 'Assign To'}
                      </button>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-yellow-500">
                      <Badge
                        color={
                          ticket.status.toLowerCase() === "closed" ? "error" :
                            ticket.status.toLowerCase() === "open" ? "info" :
                              ticket.status.toLowerCase() === "fixed" ? "success" :
                                ticket.status.toLowerCase() === "pending" ? "warning" :
                                  "light" // Default color
                        }
                      >
                        {ticket.status || "Pending"}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <div className="flex gap-3">
                        <button className="text-green-500" onClick={() => handleReplyClick(ticket)}>
                          <MessageSquare size={18} />
                        </button>
                        <button
                          className="text-blue-500 hover:text-blue-600"
                          onClick={() => handleViewNotesClick(ticket)}
                          title="View Notes"
                        >
                          <StickyNote size={18} />
                        </button>
                      </div>

                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {dayjs(ticket.createdAt).format("D-MM-YYYY, h:mm A")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-center text-gray-500 py-4">
                    No tickets found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ticket Notes</DialogTitle>
              </DialogHeader>

              {!Array.isArray(notes) || notes.length === 0 ? (
                <p className="text-gray-500">No notes found for this ticket.</p>
              ) : (
                <ul className="space-y-3 max-h-64 overflow-y-auto">
                  {notes.map((note) => (
                    <li
                      key={note.id}
                      className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <p>{note.notes}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </DialogContent>
          </Dialog>


          <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
            <DialogContent className="p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <DialogTitle>Reply to Ticket</DialogTitle>

              <input type="hidden" value={userId ?? ""} name="userId" />
              <input type="hidden" value={selectedTicket?.id ?? ""} name="ticketId" />

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
      )}

  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <DialogContent className="p-6 max-h-[80vh] flex flex-col">
    <DialogTitle>Assign Subadmin</DialogTitle>
    <p className="text-gray-500">Select a sub-admin to assign:</p>

    {/* Scrollable list */}
    <div className="mt-4 flex-1 overflow-y-auto">
      {subAdmins?.length > 0 ? (
        <ul className="space-y-2">
          {subAdmins.map((subAdmin) => (
            <li
              key={subAdmin.id}
              className={`p-2 border rounded-md cursor-pointer 
              ${selectedTicket?.assign_to === subAdmin.id
                  ? "bg-blue-200 dark:bg-blue-700"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              onClick={() =>
                setSelectedTicket((prev) =>
                  prev ? { ...prev, assign_to: subAdmin.id } : null
                )
              }
            >
              {subAdmin.username}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No sub-admins available</p>
      )}
    </div>

    {/* Buttons fixed at bottom */}
    <div className="mt-4 flex justify-end gap-3">
      <button
        className="px-4 py-2 bg-red-500 text-white rounded-md"
        onClick={() => setIsModalOpen(false)}
      >
        Cancel
      </button>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={handleModalSubmit}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin inline mr-2" size={16} />
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
};

export default TicketsPage;









