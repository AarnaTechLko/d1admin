"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { Download, MessageSquare, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import Loading from "@/components/Loading";
// import { useSession } from 'next-auth/react';
import { UploadCloud } from "lucide-react";
import { useRoleGuard } from "@/hooks/useRoleGaurd";


interface Ticket {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  assign_to: number;
  assign_to_username: string;
  createdAt: string;
  status: string;
  assignee_name: string;

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
  parsedFiles?: string[];
}

const TicketsPage = () => {
      useRoleGuard();
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
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
      const parsedReplies = data.replies.map((reply: TicketReply): TicketReply & { parsedFiles: string[] } => ({
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
          setIsReplyModalOpen(false); 

    if (!selectedTicket) {
      Swal.fire("Error", "No ticket selected.", "error");
      return;
    }

    if (!replyMessage.trim()) {
      Swal.fire("Error", "Message cannot be empty.", "warning");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("ticketId", String(selectedTicket.id));
      formData.append("repliedBy", userId ?? "");
      formData.append("message", replyMessage.trim());
      formData.append("status", replyStatus);

      if (attachmentFile) {
        formData.append("attachment", attachmentFile);
      }

      const response = await fetch("/api/ticket/reply", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire("Success", "Reply sent successfully!", "success");

        setTickets((prevTickets) =>
          prevTickets.map((t) =>
            t.id === selectedTicket.id
              ? { ...t, status: replyStatus, message: replyMessage.trim() }
              : t
          )
        );

        setReplyMessage("");
        setAttachmentFile(null);
        setIsReplyModalOpen(false);
      } else {
        Swal.fire("Error", data.error || "Failed to send reply.", "error");
      }
    } catch (error) {
      console.error("Error submitting ticket reply:", error);
      Swal.fire("Error", "An unexpected error occurred while sending reply.", "error");
      setTicketReplies([]);
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

  // ✅ Fetch tickets when userId, searchQuery or currentPage changes
  useEffect(() => {
    if (!userId) return;

    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/ticket?search=${searchQuery}&page=${currentPage}&limit=10&userId=${userId}`
        );

        if (!response.ok) throw new Error("Failed to fetch tickets");

        const data = await response.json();
        console.log("daata", data);
        setTickets(data.ticket ?? []);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userId, searchQuery, currentPage]);


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
        setSubAdmins(data.admins);
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
      setTickets((prevTickets) =>
        prevTickets.map((t) => (t.id === selectedTicket.id ? { ...t, assign_to: subAdmin.id, assign_to_username: subAdmin.username } : t))
      );



      setIsModalOpen(false); // Close modal after assigning sub-admin
    } catch (err) {
      console.error("Error assigning sub-admin:", err);
      setError((err as Error).message); // Set the error state
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleModalSubmit = () => {
    if (!selectedTicket) {
      setError("No ticket selected");
      return;
    }
    setIsSubmitting(true);
    // Find the selected sub-admin object based on the last clicked admin (selectedTicket.assign_to)
    const assignedSubAdmin = subAdmins.find((admin) => admin.id === selectedTicket.assign_to);
    if (assignedSubAdmin) {
      handleAssignSubAdmin(assignedSubAdmin); // Call API function to assign
    } else {
      setError("Please select a sub-admin before submitting.");
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
  if (loading) {
    return <Loading />;
  }

  return (
    <div>

      {/* <div className="p-4">
        {userId && (
          <p className="mt-2 text-gray-600">Logged in as Admin ID: <strong>{userId}</strong></p>
        )}
      </div> */}

      <PageBreadcrumb pageTitle="Ticket" onSearch={setSearchQuery} />
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
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Assign To</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Status</TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start">Actions</TableCell>

              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">

              {Array.isArray(tickets) && tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.name}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.email}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.subject}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.message}</TableCell>
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
                      </div>
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

              {/* Status Dropdown */}
              <label className="block text-sm font-medium text-gray-700 mt-4">Status</label>
              <select
                className="w-full p-2 border rounded"
                value={replyStatus}
                onChange={(e) => setReplyStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Open">Open</option>
                <option value="Fixed">Fixed</option>
                <option value="Closed">Closed</option>
              </select>

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

      {/* Modal for Assigning Subadmin */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="p-6">
          <DialogTitle>Assign Subadmin</DialogTitle>
          <p className="text-gray-500">Select a sub-admin to assign:</p>

          {/* Sub-admin selection */}
          <ul className="mt-4 space-y-2">
            {subAdmins.map((subAdmin) => (
              <li
                key={subAdmin.id}
                className={`p-2 border rounded-md cursor-pointer 
             ${selectedTicket?.assign_to === subAdmin.id ? "bg-blue-200 dark:bg-blue-700" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                onClick={() => setSelectedTicket((prev) => prev ? { ...prev, assign_to: subAdmin.id } : null)}
              >
                {subAdmin.username}
                {/* ({subAdmin.email}) */}
              </li>
            ))}
          </ul>

          {/* Submit & Cancel Buttons */}
          <div className="mt-4 flex justify-end gap-3">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={handleModalSubmit}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin inline mr-2" size={16} />Submitting...
                </>
              ) : (
                "Submit"
              )}            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

  );
};

export default TicketsPage;









