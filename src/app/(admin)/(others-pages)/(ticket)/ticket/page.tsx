"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";



interface Ticket {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  assign_to: number;
  assignToUsername: string;
  createdAt: string;
  status: string;
}
interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
}

const TicketsPage = () => {
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

  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();


  const handleReplyClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setReplyMessage(ticket.message);
    setReplyStatus(ticket.status);
    setIsReplyModalOpen(true);
  };



  const handleReplySubmit = async () => {
    if (!selectedTicket) {
      Swal.fire("Error", "No ticket selected.", "error");
      return;
    }


    try {
      const response = await fetch("/api/ticket/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id, // Use the selected ticket's ID
          repliedBy: userId,
          message: replyMessage,
          status: replyStatus,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire("Success", "Reply sent successfully!", "success");

        setTickets((prevTickets) =>
          prevTickets.map((t) =>
            t.id === selectedTicket.id ? { ...t, status: replyStatus } : t
          )
        );

        setIsReplyModalOpen(false);
      } else {
        Swal.fire("Error", data.error || "Failed to send reply.", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "An unexpected error occurred.", "error");
    }
  };


  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/ticket?search=${searchQuery}&page=${currentPage}&limit=10`);

        if (!response.ok) throw new Error("Failed to fetch tickets");

        // console.log("response ticket status:",response.text());
        const data = await response.json();
        setTickets(data.tickets);

        setTotalPages(data.totalPages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [searchQuery, currentPage]);

  useEffect(() => {
    const fetchSubAdmins = async () => {
      try {
        const response = await fetch(`/api/subadmin`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch sub-admins");

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
        body: JSON.stringify({ ticketId: selectedTicket.id, assignTo: subAdmin.id }),
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
        prevTickets.map((t) => (t.id === selectedTicket.id ? { ...t, assign_to: subAdmin.id, assignToUsername: subAdmin.username } : t))
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



  useEffect(() => {
    // ✅ Try retrieving user_id from localStorage or sessionStorage
    const storedUserId = localStorage.getItem("user_id") || sessionStorage.getItem("user_id");

    if (!storedUserId) {
      // 🔴 If no user_id, redirect to signin page
      router.push("/signin");
    } else {
      // ✅ Set the user ID
      setUserId(storedUserId);
    }
  }, [router]);


  return (
    <div>

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
          <div className="p-4 text-gray-700 dark:text-gray-300">Total Tickets: {tickets.length}</div>

          <Table>
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
              {tickets.map((ticket) => (
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
                      {ticket.assignToUsername || "Assign To"}
                    </button>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-yellow-500">
                    <Badge
                      color={
                        ticket.status.toLowerCase() === "closed" ? "info" :
                          ticket.status.toLowerCase() === "open" ? "primary" :
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
              ))}
            </TableBody>
          </Table>



          <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
            <DialogContent className="p-6">
              <DialogTitle>Reply to Ticket</DialogTitle>
              <input type="hidden" value={userId ?? ""} name="userId" />
              <input type="hidden" value={selectedTicket?.id ?? ""} name="ticketId" />
              <label className="block text-sm font-medium text-gray-700">Messages</label>

              <textarea
                className="w-full p-2 border rounded"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
              <label className="block text-sm font-medium text-gray-700">Status</label>

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
              <div className="mt-4 flex justify-end gap-3">
                <button className="px-4 py-2 bg-red-500 text-white rounded-md" onClick={() => setIsReplyModalOpen(false)}>
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center justify-center"
                  onClick={handleReplySubmit}
                // Disable button while loading
                >
                  {loading ? (
                    <Loader2 className="animate-spin text-blue-300 mr-2" size={16} /> // Info color loader
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









