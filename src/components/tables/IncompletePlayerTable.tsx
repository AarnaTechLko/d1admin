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
import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { inCompletePlayer } from "@/app/types/types";

interface PlayerTableProps {
  data: inCompletePlayer[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  loading?: boolean;
}

const IncompletePlayerTable: React.FC<PlayerTableProps> = ({
  data = [],
  currentPage,
  totalPages,
  setCurrentPage,
  loading = false,
}) => {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="w-full overflow-x-auto">
        <Table className="text-xs min-w-[800px] sm:min-w-full">
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell className="px-4 py-2 sm:px-5 sm:py-3 text-gray-500 text-sm font-medium bg-gray-200 dark:text-gray-400">
                Player
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.length === 0 && (
              <TableRow>
                <TableCell className="px-4 py-3 text-center" colSpan={1}>
                  No players found
                </TableCell>
              </TableRow>
            )}

            {data.map((player) => (
              <TableRow key={player.id} className="bg-white">
                <TableCell className="px-4 py-3 text-start">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="block font-medium text-gray-800 dark:text-white/90">
                        {player.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-2 p-4 flex-wrap border-t border-gray-200 dark:border-white/[0.05]">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            disabled={loading}
            className={`px-3 py-1 rounded-md ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "text-blue-500 hover:bg-gray-200"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IncompletePlayerTable;
