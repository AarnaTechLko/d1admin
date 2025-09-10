"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";

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
  ticket_from: number;
  role: string;
  escalate: boolean;
}

interface SupportModalProps {
  setSupportOpen: (open: boolean) => void;
  onTicketCreated?: (ticket: Ticket) => void;
}

interface User {
  id: number;
  name?: string;
  email?: string;
  country?: string;
  state?: string;
  city?: string;
  gender?: string;
  position?: string;
}

const SupportModal1: React.FC<SupportModalProps> = ({
  setSupportOpen,
  onTicketCreated,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    assign_to: 0,
  });
  const [userType, setUserType] = useState<"player" | "coach" | "staff">("player");
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

 

  // Fetch users based on selected type and filters
  const fetchUsers = async () => {
    try {
      const query = new URLSearchParams({
        type: userType,
       
      });

      const res = await fetch(`/api/geolocation/${userType}?${query}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      setUsers(arr);

      
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  useEffect(() => {
    setSupportOpen(true);

    if (session?.user) {
      sessionStorage.setItem("username", session.user.username || "");
      sessionStorage.setItem("email", session.user.email || "");
    }

    const storedUsername = sessionStorage.getItem("username");
    const storedEmail = sessionStorage.getItem("email");

    setFormData((prev) => ({
      ...prev,
      name: storedUsername ?? "",
      email: storedEmail ?? "",
    }));

    fetchUsers();
  }, [session, setSupportOpen, userType,]);



  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        onTicketCreated?.(result.ticket);
        Swal.fire({
          title: "Success!",
          text: result.message,
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => setSupportOpen(false));
      } else {
        Swal.fire({
          title: "Error!",
          text: result.message,
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while submitting the ticket.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 mt-20">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">Create a New Ticket</h2>

        {/* User Type Selection */}
        <div className="mb-4 flex space-x-4">
          {["player", "coach", "staff"].map((type) => (
            <label key={type} className="flex items-center space-x-2">
              <input
                type="radio"
                name="userType"
                value={type}
                checked={userType === type}
                onChange={() => setUserType(type as "player" | "coach" | "staff")}
              />
              <span className="capitalize">{type}</span>
            </label>
          ))}
        </div>

     

        {/* Assign To Dropdown */}
        <div className="mb-4">
          <label htmlFor="assign_to" className="block mb-2">Assign To</label>
          <select
            id="assign_to"
            className="w-full p-2 border rounded"
            value={formData.assign_to}
            onChange={handleChange}
            required
          >
            <option value={0}>Select</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name & Email */}
          <div className="mb-4 flex space-x-4">
            <input type="text" id="name" value={formData.name} readOnly className="w-1/2 p-2 border rounded" />
            <input type="email" id="email" value={formData.email} readOnly className="w-1/2 p-2 border rounded" />
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label htmlFor="subject" className="block mb-2">Subject</label>
            <select id="subject" className="w-full p-2 border rounded" value={formData.subject} onChange={handleChange} required>
              <option value="">Select a subject</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Billing Issues">Billing Issues</option>
              <option value="Account Issues">Account Issues</option>
            </select>
          </div>

          {/* Message */}
          <textarea id="message" value={formData.message} onChange={handleChange} rows={5} required className="w-full p-2 border rounded mb-4" />

          <div className="flex justify-end space-x-2">
            <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setSupportOpen(false)}>Close</button>
            <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white px-4 py-2 rounded">
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportModal1;
