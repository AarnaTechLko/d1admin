"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Loader2, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
// import { useSession } from "next-auth/react";

interface Recipient {
  id: string;
  name: string;
  email: string;
  country?: string | null;
  state?: string | null;
  city?: string | null;
}

const NewTicketPage = () => {
  const router = useRouter();
  // const { data: session } = useSession();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    status: "",
    recipientType: "", // ✅ selected type
    role: "",          // ✅ will be saved in DB
  });

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
const [loadingRecipients, setLoadingRecipients] = useState(false);

  const filteredRecipients = recipients.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const storedUserId =
      localStorage.getItem("user_id") || sessionStorage.getItem("user_id");
    if (!storedUserId) router.push("/signin");
    else setUserId(storedUserId);
  }, [router]);

  // Fetch recipients whenever recipientType changes
useEffect(() => {
  const fetchRecipients = async () => {
    if (!formData.recipientType) return;

    setLoadingRecipients(true); // ⏳ start loader
    try {
      const res = await axios.get(`/api/geolocation/${formData.recipientType}`);
      setRecipients(res.data || []);
    } catch (err) {
      console.error("Error fetching recipients:", err);
      setRecipients([]);
    } finally {
      setLoadingRecipients(false); // ✅ stop loader
    }
  };

  fetchRecipients();
}, [formData.recipientType]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ when recipientType changes, update role too
  const handleRecipientTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      recipientType: e.target.value,
      role: e.target.value, // ✅ store role = type
      ticket_from: "", // reset when changing type
    }));
    setSearchTerm("");
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);

  //   try {
  //     const response = await fetch("/api/ticket", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData), // ✅ includes role now
  //     });

  //     const result = await response.json();
  //     if (response.ok) {
  //       Swal.fire({
  //         title: "Success!",
  //         text: result.message,
  //         icon: "success",
  //         confirmButtonText: "OK",
  //       });
  //     } else {
  //       Swal.fire({
  //         title: "Error!",
  //         text: result.error || "Failed to create ticket",
  //         icon: "error",
  //         confirmButtonText: "Try Again",
  //       });
  //     }
  //   } catch (err) {
  //     console.error("❌ Ticket submit error:", err);
  //     Swal.fire({
  //       title: "Error!",
  //       text: "An error occurred while submitting the ticket.",
  //       icon: "error",
  //       confirmButtonText: "Try Again",
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const payload = {
      ...formData,
      user_id: userId, // ✅ include user id
    };

    const response = await fetch("/api/ticket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (response.ok) {
      Swal.fire({
        title: "Success!",
        text: result.message,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
    window.location.reload(); // 🔄 reload the full page
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: result.error || "Failed to create ticket",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  } catch (err) {
    console.error("❌ Ticket submit error:", err);
    Swal.fire({
      title: "Error!",
      text: "An error occurred while submitting the ticket.",
      icon: "error",
      confirmButtonText: "Try Again",
    }).then(() => {
    window.location.reload(); // 🔄 reload the full page
      });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 mt-0">
      <form
        onSubmit={handleSubmit}
        className="w-full border bg-white p-8 rounded-xl shadow-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-800">Create New Ticket</h2>

        {/* Recipient Type */}
        <div className="space-x-4">
          <label className="font-medium text-gray-700">Send To:</label>
          {["player", "coach", "staff"].map((type) => (
            <label key={type} className="inline-flex items-center space-x-2">
              <input
                type="radio"
                name="recipientType"
                value={type}
                checked={formData.recipientType === type}
                onChange={handleRecipientTypeChange}
                className="form-radio"
              />
              <span className="capitalize">{type}</span>
            </label>
          ))}
        </div>

        {/* Recipient Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Recipient
          </label>

          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search recipient..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none pr-10"
              required
            />

            {/* Toggle Icon */}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {/* Dropdown list */}
            {isOpen && (
             <ul className="absolute left-0 right-0 mt-1 z-10 bg-white border rounded-md max-h-60 overflow-y-auto shadow-lg">
              {loadingRecipients ? (
                <li className="p-4 text-center text-gray-500">
                  <span className="animate-spin h-5 w-5 mr-2 inline-block border-2 border-blue-500 border-t-transparent rounded-full"></span>
                  Loading...
                </li>
              ) : filteredRecipients.length > 0 ? (
                filteredRecipients.map((r) => (
                  <li
                    key={r.id}
                    className="p-2 cursor-pointer hover:bg-blue-100"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        name: r.name, // ✅ save recipient name
                        email: r.email, // ✅ save recipient email
                        ticket_from: sessionStorage.getItem("user_id"),
                      }));
                      setSearchTerm(r.name || r.email);
                      setIsOpen(false);
                    }}
                  >
                    {r.name} ({r.email})
                  </li>
                ))
              ) : (
                <li className="p-2 text-gray-500">No results found</li>
              )}
            </ul>

            )}
          </div>
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label htmlFor="subject" className="block mb-2">
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            className="w-full p-2 border rounded"
            value={formData.subject}
            onChange={handleChange}
            required
          >
            <option value="">Select a subject</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Billing Issues">Billing Issues</option>
            <option value="Account Issues">Account Issues</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border rounded-md resize-none"
            required
          />
        </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-between items-center">
        {/* Escalate button */}
        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} /> Submitting...
            </>
          ) : (
            "Submit Ticket"
          )}
        </button>
      </div>
      </form>
    </div>
  );
};

export default NewTicketPage;
