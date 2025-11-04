"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

// ✅ Define TypeScript interface for a message
interface AdminMessage {
  id: number;
  receiverType: string | null;
  receiverName: string | null;
  receiverImage: string | null;
  message: string | null;
  methods: string[] | string | null;
  senderName: string | null;
  senderImage: string | null;
  formattedDate: string | null;
}

export default function AdminMessagesTable() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedMessages, setExpandedMessages] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/viewnotification");
        if (!res.ok) throw new Error("Failed to fetch admin messages");
        const data: AdminMessage[] = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("❌ Error fetching admin messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  // ✅ Search filter (case-insensitive)
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const query = search.toLowerCase();

      const receiverName = (msg.receiverName || "").toLowerCase();
      const receiverType = (msg.receiverType || "").toLowerCase();
      const messageText = (msg.message || "").toLowerCase();

      const methodsText =
        typeof msg.methods === "string"
          ? msg.methods.toLowerCase()
          : JSON.stringify(msg.methods || "").toLowerCase();

      return (
        receiverName.includes(query) ||
        receiverType.includes(query) ||
        messageText.includes(query) ||
        methodsText.includes(query)
      );
    });
  }, [messages, search]);

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMessages = filteredMessages.slice(startIndex, startIndex + itemsPerPage);

  const handleToggleExpand = (id: number) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-4 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Admin Messages
      </h2>

      {/* 🔍 Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      {/* 🧾 Table */}
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-gray-700 dark:text-gray-200">Send To</th>
            <th className="px-4 py-3 text-gray-700 dark:text-gray-200">Receiver</th>
            <th className="px-4 py-3 text-gray-700 dark:text-gray-200">Message</th>
            <th className="px-4 py-3 text-gray-700 dark:text-gray-200">Method</th>
            <th className="px-4 py-3 text-gray-700 dark:text-gray-200">Send By</th>
            <th className="px-4 py-3 text-gray-700 dark:text-gray-200">Date</th>
          </tr>
        </thead>

        <tbody>
          {currentMessages.length > 0 ? (
            currentMessages.map((msg) => {
              const isExpanded = expandedMessages[msg.id];
              const isLong = (msg.message?.length ?? 0) > 200;
              const displayText = isExpanded
                ? msg.message
                : msg.message?.slice(0, 50) + (isLong ? "..." : "");

              return (
                <tr
                  key={msg.id}
                  className="border-b text-xs dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {/* Send To (Receiver Type) */}
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 capitalize">
                    {msg.receiverType || "—"}
                  </td>

                  {/* Receiver Info */}
                  <td className="px-4 py-3 flex items-center space-x-2">
                    <Image
                      src={msg.receiverImage || "/images/signin/d1.png"}
                      alt={msg.receiverName || "Receiver"}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                    <span className="text-gray-700 dark:text-gray-200">
                      {msg.receiverName || "Unknown"}
                    </span>
                  </td>

                  {/* Message */}
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 break-words max-w-xs">
                    {displayText}
                    {isLong && (
                      <button
                        onClick={() => handleToggleExpand(msg.id)}
                        className="text-blue-600 ml-2 underline text-sm"
                      >
                        {isExpanded ? "View Less" : "View More"}
                      </button>
                    )}
                  </td>

                  {/* Methods */}
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {Array.isArray(msg.methods)
                      ? msg.methods.join(", ")
                      : msg.methods || "—"}
                  </td>

                  {/* Sender */}
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {msg.senderName || "Admin"}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {msg.formattedDate || "—"}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={6}
                className="text-center py-6 text-gray-500 dark:text-gray-400"
              >
                No messages found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 📄 Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

