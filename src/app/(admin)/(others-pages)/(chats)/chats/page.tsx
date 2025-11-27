
// "use client";

// import { useEffect, useRef, useState } from "react";

// interface ChatRow {
//   id: string;
//   name: string;
//   email: string;
//   phone: string | number;
//   message?: string;
//   createdAt?: string;
//   status?: number; // 1 = active, 0 = inactive
//   unread?: boolean; // NEW
//   hasNew?: boolean; // green dot
// }

// interface Message {
//   id: string;
//   sender: "guest" | "admin";
//   message: string;
//   timestamp: string;
// }

// export default function GuestChatsPage() {
//   const [data, setData] = useState<ChatRow[]>([]);
//   const [filteredData, setFilteredData] = useState<ChatRow[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchText, setSearchText] = useState("{}");
//   const [activeChat, setActiveChat] = useState<ChatRow | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [selectedFilter, setSelectedFilter] = useState("All");
//   const [inputMessage, setInputMessage] = useState("");

//   const bottomRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     fetchChats();
//   }, []);

//   const scrollToBottom = () => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Fetch chats
//   const fetchChats = async () => {
//     try {
//       const res = await fetch("/api/guest");
//       const result = await res.json();

//       if (result.success) {
//         const modified = result.data.map((chat: any) => ({
//           ...chat,
//           unread: chat.lastSender === "guest", // back-end must return lastSender
//         }));

//         setData(modified);
//         setFilteredData(modified);
//       }
//     } catch (error) {
//       console.log("Error fetching chats", error);
//     }
//     setLoading(false);
//   };

//   // Search
//   const handleSearch = (value: string) => {
//     setSearchText(value);
//     applyFilters(value, selectedFilter);
//   };

//   // Filter
//   const applyFilters = (search: string, filter: string) => {
//     let rows = [...data];

//     if (filter === "Active") rows = rows.filter((r) => r.status === 1);
//     if (filter === "Inactive") rows = rows.filter((r) => r.status === 0);

//     if (search.trim()) {
//       rows = rows.filter(
//         (item) =>
//           item.name.toLowerCase().includes(search.toLowerCase()) ||
//           item.email.toLowerCase().includes(search.toLowerCase()) ||
//           String(item.phone).includes(search) ||
//           item.message?.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     setFilteredData(rows);
//   };

//   const changeFilter = (filter: string) => {
//     setSelectedFilter(filter);
//     applyFilters(searchText, filter);
//   };

//   // Load messages
//   const loadChatMessages = async (chatId: string) => {
//     const res = await fetch(`/api/guest/messages?chatId=${chatId}`);
//     const result = await res.json();
//     if (result.success) setMessages(result.data);
//   };

//   const openChat = (row: ChatRow) => {

//     setActiveChat(row);

//     // Mark unread → read
//     setData((prev) => prev.map((c) => (c.id === row.id ? { ...c, unread: false } : c)));
//     setFilteredData((prev) => prev.map((c) => (c.id === row.id ? { ...c, unread: false } : c)));

//     loadChatMessages(row.id);
//   };

//   // Send message
//   const sendMessage = async () => {
//     if (!inputMessage.trim() || !activeChat) return;

//     const payload = {
//       chatId: activeChat.id,
//       message: inputMessage,
//       sender: "admin",
//     };

//     const res = await fetch("/api/guest/send", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     const result = await res.json();
//     if (result.success) {
//       setMessages((prev) => [...prev, result.data]);
//       setInputMessage("");
//     }
//   };

//   return (
//     <div className="w-full h-[90vh] bg-gray-100 flex">
//       {/* LEFT SIDEBAR */}
//       <div className="w-[32%] bg-white border-r flex flex-col">
//         <div className="p-4 border-b">
//           <h1 className="text-2xl font-semibold text-gray-800">Guest Chats</h1>

//           <input
//             type="text"
//             placeholder="Search"
//             value={searchText}
//             onChange={(e) => handleSearch(e.target.value)}
//             className="w-full px-4 py-2 mt-3 bg-gray-100 rounded-full focus:ring-2 
//             focus:ring-green-500 outline-none"
//           />

//           <div className="flex gap-2 mt-3">
//             {['All', 'Active', 'Inactive'].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => changeFilter(tab)}
//                 className={`px-4 py-1 rounded-full text-sm transition ${selectedFilter === tab
//                     ? 'bg-green-600 text-white'
//                     : 'bg-gray-200 hover:bg-green-200'
//                   }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* CHAT LIST */}
//         <div className="overflow-y-auto flex-1">
//           {loading ? (
//             <div className="text-center py-6">Loading…</div>
//           ) : filteredData.length === 0 ? (
//             <div className="text-center py-6">No chats found</div>
//           ) : (
//             filteredData.map((row) => (
//               <div
//                 key={row.id}
//                 className={`relative flex items-center gap-3 px-4 py-3 cursor-pointer border-b ${activeChat?.id === row.id ? "bg-green-100" : "hover:bg-gray-100"
//                   }`}
//                 onClick={() => openChat(row)}
//               >
//                 {/* GREEN DOT */}
//                 {row.hasNew && (
//                   <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//                 )}

//                 <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold text-gray-700">
//                   {row.name?.charAt(0).toUpperCase()}
//                 </div>

//                 <div className="flex-1">
//                   <div className="flex justify-between">
//                     <h3 className="font-semibold text-gray-800">{row.name}</h3>
//                     <span className="text-xs text-gray-500">
//                       {row.createdAt
//                         ? new Date(row.createdAt).toLocaleTimeString([], {
//                           hour: '2-digit',
//                           minute: '2-digit',
//                         })
//                         : ''}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-600 truncate max-w-[180px]">{row.message}</p>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* RIGHT CHAT WINDOW */}
//       <div className="flex-1 flex flex-col bg-gray-50">
//         {!activeChat ? (
//           <div className="flex flex-col items-center justify-center h-full text-center px-6">
//             <img src="/whatsapp-illustration.png" className="w-72 opacity-70" />
//             <h2 className="text-3xl font-semibold text-gray-700 mt-6">
//               Welcome to Guest Chats
//             </h2>
//             <p className="text-gray-500 mt-2">
//               Select a chat from the left to view messages.
//             </p>
//           </div>
//         ) : (
//           <>
//             <div className="px-4 py-3 bg-white shadow flex items-center gap-3">
//               <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold text-gray-700">
//                 {activeChat.name.charAt(0).toUpperCase()}
//               </div>
//               <div>
//                 <h3 className="font-semibold text-gray-800">{activeChat.name}</h3>
//                 <p className="text-xs text-gray-500">{activeChat.email}</p>
//               </div>
//             </div>

//             {/* FIRST MESSAGE (GUEST INITIAL TEXT) */}
//             {activeChat.message && (
//               <div className=" px-4 py-2 rounded-xl max-w-[70%] text-sm shadow mt-3 ml-4">
//                 {activeChat.message}
//               </div>
//             )}

//             {/* MESSAGE LIST */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-3">
//               {messages.map((msg) => (
//                 <div
//                   key={msg.id}
//                   className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
//                 >
//                   <div
//                     className={`px-4 py-2 rounded-xl max-w-[70%] text-sm shadow ${msg.sender === "admin" ? "bg-green-600 text-white" : "bg-white border"
//                       }`}
//                   >
//                     {msg.message}
//                   </div>
//                 </div>
//               ))}
//               <div ref={bottomRef}></div>
//             </div>

//             {/* INPUT BOX */}
//             <div className="p-3 bg-white flex gap-2 border-t">
//               <input
//                 type="text"
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 placeholder="Type a message…"
//                 className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-500 outline-none"
//               />

//               <button
//                 onClick={sendMessage}
//                 className="px-5 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
//               >
//                 Send
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }


// FULL FINAL COMPLETED CODE WITH GREEN DOT

"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface ChatRow {
  id: string;
  name: string;
  email: string;
  phone: string | number;
  message?: string;
  createdAt?: string;
  status?: number;
  hasNew?: boolean;
}

interface Message {
  id: string;
  sender: "guest" | "admin";
  message: string;
  timestamp: string;
}

export default function GuestChatsPage() {
  const [data, setData] = useState<ChatRow[]>([]);
  const [filteredData, setFilteredData] = useState<ChatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeChat, setActiveChat] = useState<ChatRow | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  useEffect(() => {
    fetchChats();
  }, []);

  // ---------------- TOAST FUNCTION ----------------------
  const notifyNewMessage = () => {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: "#fff",
    });

    Toast.fire({
      icon: "info",
      title: "New message received — Click here",
      didOpen: (toast) => {
        toast.addEventListener("click", () => {
          window.location.href = "/chats"; // redirect to chats page
        });
      },
    });
  };

  // ---------------- FETCH CHAT LIST ----------------------
  const fetchChats = async () => {
    try {
      const res = await fetch("/api/guest");
      const result = await res.json();
      if (result.success) {
        const chats = result.data.map((row: ChatRow) => ({
          ...row,
          hasNew: row.status === 1 && row.message ? true : false,
        }));
        setData(chats);
        setFilteredData(chats);
      }
    } catch (error) {
      console.log("Error fetching chats", error);
    }
    setLoading(false);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, selectedFilter);
  };

  const applyFilters = (search: string, filter: string) => {
    let rows = [...data];

    if (filter === "Active") rows = rows.filter((r) => r.status === 1);
    if (filter === "Inactive") rows = rows.filter((r) => r.status === 0);

    if (search.trim()) {
      rows = rows.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        String(item.phone).includes(search) ||
        item.message?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredData(rows);
  };

  const changeFilter = (filter: string) => {
    setSelectedFilter(filter);
    applyFilters(searchText, filter);
  };

  // ---------------- LOAD MESSAGES ----------------------
  const loadChatMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/guest/messages?chatId=${chatId}`);
      const result = await res.json();

      if (result.success) {
        setMessages(result.data);

        // Detect last message sender
        const lastMsg = result.data[result.data.length - 1];
        if (lastMsg && lastMsg.sender === "user") {
          notifyNewMessage(); // 🔥 Show toast
        }
      }
    } catch (error) {
      console.log("Error loading messages", error);
    }
  };

  const openChat = (row: ChatRow) => {
    row.hasNew = false;
    setActiveChat({ ...row });
    loadChatMessages(row.id);
  };

  // ---------------- SEND MESSAGE ----------------------
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    try {
      const res = await fetch("/api/guest/messages", {
        method: "POST",
        body: JSON.stringify({
          chatId: activeChat.id,
          sender: "admin",
          message: newMessage,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            sender: "admin",
            message: newMessage,
            timestamp: new Date().toISOString(),
          },
        ]);
        setNewMessage("");
      }
    } catch (error) {
      console.log("Message send error:", error);
    }
  };

  return (
    <div className="w-full h-[90vh] bg-gray-100 flex">
      {/* LEFT SIDE */}
      <div className="w-[32%] bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-semibold text-gray-800">Guest Chats</h1>

          <input
            type="text"
            placeholder="Search"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 mt-3 bg-gray-100 rounded-full"
          />

          <div className="flex gap-2 mt-3">
            {["All", "Active", "Inactive"].map((tab) => (
              <button
                key={tab}
                onClick={() => changeFilter(tab)}
                className={`px-4 py-1 rounded-full text-sm ${
                  selectedFilter === tab
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 hover:bg-green-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
            {loading ? (
             <div className="text-center py-6">Loading…</div>
           ) : filteredData.length === 0 ? (
             <div className="text-center py-6">No chats found</div>
           ) : (
          filteredData.map((row) => (
            <div
              key={row.id}
              onClick={() => openChat(row)}
              className={`flex items-center gap-3 px-4 py-3 border-b cursor-pointer ${
                activeChat?.id === row.id
                  ? "bg-green-100"
                  : "hover:bg-gray-100"
              }`}
            >
              {row.hasNew && (
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              )}

              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold text-gray-700">
                {row.name?.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{row.name}</h3>
                <p className="text-sm text-gray-600 truncate max-w-[180px]">
                  {row.message}
                </p>
              </div>
            </div>
          ))
        )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {!activeChat ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-lg">
            Select a chat to start messaging
          </div>
        ) : (
          <>
            {/* CHAT HEADER */}
            <div className="relative px-4 py-3 bg-white shadow flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold text-gray-700">
                  {activeChat.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">{activeChat.name}</h3>
                  <h3 className="text-xs text-gray-800">{activeChat.phone}</h3>
                  <p className="text-xs text-gray-500">{activeChat.email}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveChat(null)}
                className="absolute right-4 top-3 text-gray-500 hover:text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>
            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeChat.message && (
                <div className="px-4 py-2 rounded-xl max-w-[70%] text-sm shadow mt-3 self-start">
                  {activeChat.message}
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "admin" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-xl max-w-[70%] text-sm shadow ${
                      msg.sender === "admin"
                        ? "bg-green-600 text-white"
                        : "bg-white border"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>

            {/* MESSAGE INPUT */}
            <div className="p-3 bg-white flex gap-2 border-t">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1 px-4 py-2 border rounded-full"
              />
              <button
                onClick={sendMessage}
                className="px-5 bg-green-600 text-white rounded-full"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


