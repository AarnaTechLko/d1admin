"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { MessageSquare, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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

interface SubAdmin {
  id: number;
  username: string;
}

interface TicketReply {
  id: number;
  ticketId: number;
  message: string;
  status: string;
  repliedBy: string;
  createdAt: string;
}

interface Props {
  data?: Ticket[];
  currentPage?: number;
  totalPages?: number;
  setCurrentPage?: React.Dispatch<React.SetStateAction<number>>;
  onAssignClick?: (ticket: Ticket) => void;
  onReplyClick?: (ticket: Ticket) => void;
  searchQuery?: string;
  page?: number;
}

const TicketTable: React.FC<Props> = ({
  data,
  searchQuery = "",
  page = 1,
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [replyStatus, setReplyStatus] = useState<string>("");
  const [ticketReplies, setTicketReplies] = useState<TicketReply[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchSubAdmins = async () => {
      try {
        const response = await fetch("/api/subadmin");
        if (!response.ok) throw new Error("Failed to fetch sub-admins");
        const data = await response.json();
        setSubAdmins(data.admins);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    fetchSubAdmins();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tickets?search=${searchQuery}&page=${page}&limit=10`);
      if (!response.ok) throw new Error("Failed to fetch tickets");
      const data = await response.json();
      setTickets(data.ticket ?? []);
    } catch (err) {
      setError((err as Error).message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data === undefined) {
      fetchTickets();
    } else {
      setTickets(data);
      setLoading(false);
    }
  }, [searchQuery, page, data, currentPage]);

  const handleReplyClick = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setReplyStatus(ticket.status);
    setIsReplyModalOpen(true);
    try {
      const res = await fetch(`/api/ticket/replies?ticketId=${ticket.id}`);
      if (!res.ok) throw new Error("Failed to fetch replies");
      const data = await res.json();
      setTicketReplies(data.replies);
    } catch (err) {
      console.error("Error loading ticket messages:", err);
      Swal.fire("Error", "Could not load ticket messages.", "error");
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedTicket || !replyMessage || !replyStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ticket/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          message: replyMessage,
          status: replyStatus,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit reply");
      setIsReplyModalOpen(false);
      fetchTickets();
    } catch {
      Swal.fire("Error", "Could not submit reply.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToClick = (ticket: Ticket) => {
    if (ticket.assign_to) {
      Swal.fire("Already Assigned", "This ticket is already assigned.", "info");
      return;
    }
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleAssignSubAdmin = async (subAdmin: SubAdmin) => {
    if (!selectedTicket) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/ticket/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket.id, assignTo: subAdmin.id }),
      });
      if (!response.ok) throw new Error("Failed to assign ticket");
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id ? { ...t, assign_to: subAdmin.id, assign_to_username: subAdmin.username } : t
        )
      );
      setIsModalOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isSubmitting && <p>Loading...</p>}
      {loading && <p className="text-center py-5">
      <Loader2 className="animate-spin text-gray-500" size={18} />
        
        Loading...</p>}
      {error && <p className="text-center py-5 text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <Table className="text-xs">
            <TableHeader className="border-b border-gray-100 font-medium text-sm bg-gray-200 dark:border-white/[0.05]">
              <TableRow className="bg-gray-100">
                <TableCell className="px-5 py-3 font-small text-gray-500 text-start">Name</TableCell>
                <TableCell className="px-5 py-3 font-small text-gray-500 text-start">Email</TableCell>
                <TableCell className="px-5 py-3 font-small text-gray-500 text-start">Subject</TableCell>
                <TableCell className="px-5 py-3 font-small text-gray-500 text-start">Message</TableCell>
                <TableCell className="px-5 py-3 font-small text-gray-500 text-start">Assign To</TableCell>
                <TableCell className="px-5 py-3 font-small text-gray-500 text-start">Status</TableCell>
                <TableCell className="px-5 py-3 font-small text-gray-500 text-start">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.name}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.email}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.subject}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.message}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <button className="text-blue-500 hover:underline" onClick={() => handleAssignToClick(ticket)}>
                        {ticket.assign_to_username || 'Assign To'}
                      </button>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-yellow-500">
                      <Badge
                        color={
                          ticket.status.toLowerCase() === "closed" ? "error" :
                          ticket.status.toLowerCase() === "open" ? "info" :
                          ticket.status.toLowerCase() === "fixed" ? "success" :
                          ticket.status.toLowerCase() === "pending" ? "warning" : "light"
                        }
                      >
                        {ticket.status || "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      <button className="text-green-500" onClick={() => handleReplyClick(ticket)}>
                        <MessageSquare size={18} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell  className="text-center">No tickets found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages && setCurrentPage && (
            <div className="flex justify-between items-center mt-4 gap-3 px-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
        <DialogContent>
          <DialogTitle>Reply to Ticket</DialogTitle>
          <div className="space-y-3">
            {ticketReplies.map((reply) => (
              <div key={reply.id} className="border-b pb-2">
                <p className="text-sm text-gray-700"><strong>Message:</strong> {reply.message}</p>
                <p className="text-sm"><strong>Status:</strong> {reply.status}</p>
                <p className="text-sm"><strong>By:</strong> {reply.repliedBy} at {new Date(reply.createdAt).toLocaleString()}</p>
              </div>
            ))}
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply"
              className="w-full border p-2 rounded"
              rows={3}
            />
            <select value={replyStatus} onChange={(e) => setReplyStatus(e.target.value)} className="w-full border p-2 rounded">
              <option value="Pending">Pending</option>
              <option value="Open">Open</option>
              <option value="Fixed">Fixed</option>
              <option value="Closed">Closed</option>
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsReplyModalOpen(false)} className="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
              <button onClick={handleReplySubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
                {loading ? <Loader2 className="animate-spin" size={16} /> : "Submit"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogTitle>Assign Subadmin</DialogTitle>
          <ul className="mt-4 space-y-2">
            {subAdmins.map((subAdmin) => (
              <li
                key={subAdmin.id}
                onClick={() => handleAssignSubAdmin(subAdmin)}
                className="p-2 border rounded hover:bg-gray-100 cursor-pointer"
              >
                {subAdmin.username}
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TicketTable;