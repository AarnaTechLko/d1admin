
// export default NewTicketPage;
"use client";
import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { Loader2, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";

interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
}
interface Recipient {
  role: string;
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
    recipient_name: "",
    name: "",
    email: "",
    subject: "",
    message: "",
    status: "",
    recipientType: "", // ✅ selected type
    role: "",
    assign_to_name: "",
    assign_to: 0,
  });
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [subAdmins, setSubAdmins] = useState<Admin[]>([]);

  const recipientDropdownRef = useRef<HTMLDivElement>(null);
  const assignDropdownRef = useRef<HTMLDivElement>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  //const [userId, setUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [loadingSubadmin, setLoadingSubadmin] = useState(false);
  const { data: session, status } = useSession();

  const filteredRecipients = recipients.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredStaff = subAdmins.filter((s) => {
    const term = assignSearch.toLowerCase();
    return (
      s.username.toLowerCase().includes(term) ||
      s.role.toLowerCase().includes(term)
    );
  });


  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        recipientDropdownRef.current &&
        !recipientDropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
      if (
        assignDropdownRef.current &&
        !assignDropdownRef.current.contains(e.target as Node)
      ) {
        setIsAssignOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // useEffect(() => {
  //   const storedUserId =
  //     localStorage.getItem("user_id") || sessionStorage.getItem("user_id");
  //   if (!storedUserId) router.push("/signin");
  //   else setUserId(storedUserId);
  // }, [router]);

  useEffect(() => {
  if (status === "unauthenticated") {
    router.push("/signin");
  }
}, [status, router]);


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

  const handleRecipientTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const selectedType = e.target.value;

    setFormData((prev) => ({
      ...prev,
      recipientType: selectedType,
      role: selectedType,
      name: "",            // ✅ Clear recipient name
      email: "",           // ✅ Clear recipient email
      ticket_from: "",     // ✅ Clear selected user ID
    }));

    setSearchTerm("");      // ✅ Clear search text
    setAssignSearch("");    // ✅ Clear assign search
    setIsOpen(false);       // ✅ Close recipient dropdown
    setRecipients([]);      // ✅ Clear old list before fetching new one
  };

  useEffect(() => {
    const fetchSubAdmins = async () => {
      setLoadingSubadmin(true);
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
      } finally {
        setLoadingSubadmin(false); // ✅ stop loader
      }
    };
    fetchSubAdmins();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        // user_id: userId, // ✅ include user id
         user_id: session?.user?.id, 
      };
      console.log('posted data:', payload);
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

          <div className="relative w-full" ref={recipientDropdownRef}>
            <input
              type="text"
              placeholder="Search recipient..."
              value={searchTerm || formData.name}
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
                className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : "rotate-0"
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
                          ticket_from: r.id,
                        }));
                        setSearchTerm("");
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
        {/* ✅ Assign To Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To
          </label>

          <div className="relative" ref={assignDropdownRef}>
            <input
              type="text"
              placeholder="Search staff..."
              value={assignSearch || formData.assign_to_name}

              onChange={(e) => {
                setAssignSearch(e.target.value);
                setIsAssignOpen(true);
              }}
              onFocus={() => setIsAssignOpen(true)}
              className="w-full p-3 border rounded-md"
            />

            <button
              type="button"
              className="absolute right-2 top-3"
              onClick={() => setIsAssignOpen((prev) => !prev)}
            >
              <ChevronDown />
            </button>
            {isAssignOpen && (
              <ul className="absolute w-full bg-white border mt-1 rounded-md max-h-60 overflow-y-auto">
                {loadingSubadmin ? (
                  <li className="p-4 text-center text-gray-500">
                    <span className="animate-spin h-5 w-5 mr-2 inline-block border-2 border-blue-500 border-t-transparent rounded-full"></span>
                    Loading...
                  </li>
                ) : filteredStaff.length > 0 ? (
                  filteredStaff.map((r) => (
                    <li
                      key={r.id}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          assign_to: r.id,              // ✅ store ID
                          assign_to_name: r.username,    // ✅ store username
                          recipient_name: r.username,    // ✅ store selected recipient name
                          // ticket_from: userId,           // ✅ logged-in user
                        }));

                        setAssignSearch("");
                        setIsAssignOpen(false);
                      }}
                    >
                      {r.username} ({r.role})
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-gray-500">No sub-admins found</li>
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