// "use client";
// import React from "react";
// import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

// // import Swal from "sweetalert2";
// // import withReactContent from "sweetalert2-react-content";
// import { inCompletePlayer } from "@/app/types/types";
// // import axios from "axios";
// // type RecentMessage = {
// //   sender_id: string;
// //   from: string;
// //   methods: string[]; 
// //   id: number;
// //   message: string;
// //   created_at: string;
// //   position: "left" | "right"; // for UI positioning
// //   bgColor: "green" | "blue";  // for background color
// // };
// interface PlayerTableProps {
//   data: inCompletePlayer[];
//   currentPage: number;
//   totalPages: number;
//   setCurrentPage: (page: number) => void;
// }

// const IncompletePlayerTable: React.FC<PlayerTableProps> = ({ data = [], currentPage, totalPages, setCurrentPage }) => {

//   // const [selectedCoachid, setSelectedCoachid] = useState<number | null>(null);

//   // const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);


//   // useEffect(() => {
//   //   if (selectedCoachid) {
//   //     (async () => {
//   //       try {
//   //         const res = await axios.get(`/api/messages?type=player&id=${selectedCoachid}`);
//   //         setRecentMessages(res.data.messages || []);
//   //       } catch (err) {
//   //         console.error("Error fetching messages:", err);
//   //       }
//   //     })();
//   //   }
//   // }, [selectedCoachid]);



//   return (
//     <div>


//       <div className=" mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
//         <div className="w-full overflow-x-auto">
//           <Table className="text-xs  min-w-[800px] sm:min-w-full">
//             <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
//               <TableRow>
//                 {["Player"].map((header) => (
//                   <TableCell key={header} className="px-4 py-2 sm:px-5 sm:py-3 text-gray-500 text-sm font-medium bg-gray-200 dark:text-gray-400">
//                     {header}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             </TableHeader>

//             <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
//               {data.map((player) => (
//                 <TableRow key={`${player.id}`} className={"bg-white"}>
//                   <TableCell className="px-4 py-3 text-start">
//                     <div className="flex items-center gap-3">
//                       <div>
//                         <span className="block font-medium text-gray-800 dark:text-white/90">{player.email}</span>
//                       </div>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>

//         <div className="flex justify-end items-center gap-2 p-4 flex-wrap border-t border-gray-200 dark:border-white/[0.05]">
//           {[...Array(totalPages)].map((_, index) => (
//             <button key={index + 1} onClick={() => setCurrentPage(index + 1)} className={`px-3 py-1 rounded-md ${currentPage === index + 1 ? "bg-blue-500 text-white" : "text-blue-500 hover:bg-gray-200"}`}>{index + 1}</button>
//           ))}
//         </div>

//       </div>
//     </div >
//   );
// };

// export default IncompletePlayerTable;


"use client";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { inCompletePlayer } from "@/app/types/types";
import { Dialog, DialogTitle, DialogContent, DialogHeader } from "@/components/ui/dialog";
import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
interface PlayerTableProps {
  data: inCompletePlayer[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  loading?: boolean;
}
interface ApiMessage {
  id: number;
  message: string;
  methods?: string[];
  created_at: string;
  sender_id?: string;
  from?: string;
}

type RecentMessage = {
  sender_id: string;
  from: string;
  methods: string[];
  id: number;
  message: string;
  created_at: string;
  position: "left" | "right"; // for UI positioning
  bgColor: "green" | "blue";  // for background color
};
const IncompletePlayerTable: React.FC<PlayerTableProps> = ({
  data = [],
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);
  const [sendInternal, setSendInternal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  const fetchRecentMessages = async (playerId: number) => {
    try {
      setIsMessagesLoading(true);
      setRecentMessages([]);
      const res = await axios.get("/api/messages", {
        params: { type: "player", id: playerId },
      });
      const messages: ApiMessage[] = Array.isArray(res.data)
        ? res.data
        : res.data.messages || [];

      const formatted: RecentMessage[] = messages.map((msg) => ({
        id: msg.id,
        message: msg.message,
        methods: msg.methods ?? [],
        created_at: msg.created_at,
        position: "left",
        bgColor: "blue",
        sender_id: msg.sender_id ?? "",
        from: msg.from ?? "admin",
      }));

      setRecentMessages(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  return (
    <div>
       <div className="flex justify-end items-center gap-2 p-4 flex-wrap ">
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                disabled={page === currentPage}
                className={`px-3 py-1 rounded-md transition ${currentPage === page
                  ? "bg-blue-500 text-white cursor-not-allowed"
                  : "text-blue-500 hover:bg-gray-200"
                  }`}
              >
                {page}
              </button>
            );
          })}
        </div>
   
    <div className="mt-4 overflow-hidden rounded-xl border bg-white">
      <div className="w-full overflow-x-auto">
        <Table className="text-xs min-w-[800px] sm:min-w-full">
          <TableHeader>
            <TableRow>
              <TableCell className="px-4 py-3 font-medium bg-gray-200">
                Player
              </TableCell>
              <TableCell className="px-4 py-3 font-medium bg-gray-200">
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-4">
                  No players found
                </TableCell>
              </TableRow>
            )}

            {data.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="px-4 py-3">
                  {player.email}
                </TableCell>

                <TableCell className="px-4 py-3">
                  <button
                    className="text-purple-600"
                    onClick={() => {
                      setSelectedPlayerId(Number(player.id));
                      fetchRecentMessages(Number(player.id));
                    }}
                  >
                    💬
                  </button>

                  <Dialog
                    open={selectedPlayerId === Number(player.id)}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setSelectedPlayerId(null);
                        setRecentMessages([]);
                      }
                    }}
                  >
                    <DialogContent className="max-w-md w-full bg-white rounded-2xl p-6 space-y-4">
                      <DialogHeader>
                        <DialogTitle>Send Message</DialogTitle>
                        <p className="text-sm text-gray-500">
                          Send a message to{" "}
                          <span className="font-medium text-black">
                            {player.email}
                          </span>
                        </p>
                      </DialogHeader>

                      {/* Message Type */}
                      <div className="flex gap-4 text-sm">
                        <label>
                          <input
                            type="checkbox"
                            checked={sendEmail}
                            onChange={() => setSendEmail(!sendEmail)}
                          /> Email
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={sendSMS}
                            onChange={() => setSendSMS(!sendSMS)}
                          /> SMS
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={sendInternal}
                            onChange={() => setSendInternal(!sendInternal)}
                          /> Internal
                        </label>
                      </div>

                      <textarea
                        rows={4}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="w-full border rounded-lg p-2 text-sm"
                        placeholder="Enter your message..."
                      />
                      {/* Recent Messages */}
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {isMessagesLoading ? (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></span>
                            Loading messages...
                          </div>
                        ) : recentMessages.length === 0 ? (
                          <p className="text-xs text-gray-500">No previous messages</p>
                        ) : (
                          recentMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-2 rounded ${msg.bgColor === "green" ? "bg-green-100" : "bg-blue-100"
                                }`}
                            >
                              <p className="text-xs">{msg.message}</p>
                              <p className="text-[10px] text-gray-500">
                                {new Date(msg.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      {/* Actions */}
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setSelectedPlayerId(null)}
                          className="px-4 py-2 bg-gray-200 rounded-lg"
                        >
                          Cancel
                        </button>

                        <button
                          disabled={isSending}
                          onClick={async () => {
                            if (!messageText.trim()) {
                              Swal.fire("Warning", "Enter message", "warning");
                              return;
                            }

                            if (!sendEmail && !sendSMS && !sendInternal) {
                              Swal.fire("Warning", "Select at least one method", "warning");
                              return;
                            }

                            try {
                              setIsSending(true);

                              await axios.post(`/api/geolocation/player`, {
                                targetIds: [player.id],
                                message: messageText,
                                methods: {
                                  email: sendEmail,
                                  sms: sendSMS,
                                  internal: sendInternal,
                                },
                              });

                              Swal.fire("Success", "Message sent!", "success");

                              setSelectedPlayerId(null);
                              setMessageText("");
                              setSendEmail(false);
                              setSendSMS(false);
                              setSendInternal(false);
                            } catch (err) {
                              Swal.fire("Error", "Failed to send message", "error");
                            console.error("Error sending message:", err);

                            } finally {
                              setIsSending(false);
                            }
                          }}
                          className={`px-4 py-2 rounded-lg text-white ${isSending
                              ? "bg-gray-400"
                              : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                          {isSending ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    
    </div>
    </div>
  );
};

export default IncompletePlayerTable;
