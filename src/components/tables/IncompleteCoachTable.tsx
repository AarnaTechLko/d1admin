"use client";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { inCompleteCoach } from "@/app/types/types";
// import router from "next/router";
import { useRouter } from "next/navigation";
import axios from "axios";
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
interface CoachTableProps {
  data: inCompleteCoach[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const IncompleteCoachTable: React.FC<CoachTableProps> = ({ data = [], currentPage, totalPages, setCurrentPage }) => {
  // const [showConfirmation, setShowConfirmation] = useState(false);
  // const [confirmationCallback, setConfirmationCallback] = useState<() => void>(() => () => { });
  const [ipOpen, setIpOpen] = useState<number | null>(null);
  const [ipData, setIpData] = useState<{ ip: string; loginTime: string }[]>([]);
  // const itemsPerPage = 10;
  // const numberOfPages = Math.ceil(totalPages / itemsPerPage);

  // console.log("Total: ", numberOfPages);
  // console.log("Data: ", data)

  // const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // console.log("Paginated: ", paginatedData);

  const [isCoachPasswordModalOpen, setCoachPasswordModalOpen] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);
  const [selectedCoachid, setSelectedCoachid] = useState<number | null>(null);

  const [newCoachPassword, setNewCoachPassword] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);
  const [sendInternal, setSendInternal] = useState(false);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);

  // const userRole = sessionStorage.getItem("role");
  const router = useRouter();
  const handleOpenCoachModal = (coachId: number) => {
    setSelectedCoachId(coachId);
    setCoachPasswordModalOpen(true);
  };

  useEffect(() => {
    if (selectedCoachid) {
      (async () => {
        try {
          const res = await axios.get(`/api/messages?type=coach&id=${selectedCoachid}`);
          setRecentMessages(res.data.messages || []);
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      })();
    }
  }, [selectedCoachid]);

  const handleCloseCoachModal = () => {
    setSelectedCoachId(null);
    setNewCoachPassword("");
    setCoachPasswordModalOpen(false);
  };

  const handleFetchIpInfo = async (userId: number, type: 'player' | 'coach' | 'enterprise') => {
    try {
      const res = await fetch(`/api/ip_logstab?userId=${userId}&type=${type}`);
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const result = await res.json();
      console.log("IP Log Response:", result);

      setIpData(result.data || []); // Set the IP data for dialog
      setIpOpen(userId);            // Open dialog for that user
    } catch (error) {
      console.error("Failed to fetch IP logs:", error);
    }
  };

  return (
    <div>
      <div className=" mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="w-full overflow-x-auto">
          <Table className="text-xs  min-w-[800px] sm:min-w-full">
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {["Coach"].map((header) => (
                  <TableCell key={header} className="px-4 py-2 sm:px-5 sm:py-3 text-gray-500 text-sm font-medium bg-gray-200 dark:text-gray-400">
                    {header}
                  </TableCell>
                ))}

              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((coach) => (
                <TableRow key={`${coach.id}`} className={"bg-white"}>
                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 dark:text-white/90">{coach.email}</span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end items-center gap-2 p-4 flex-wrap border-t border-gray-200 dark:border-white/[0.05]">
          {[...Array(totalPages)].map((_, index) => (
            <button key={index + 1} onClick={() => setCurrentPage(index + 1)} className={`px-3 py-1 rounded-md ${currentPage === index + 1 ? "bg-blue-500 text-white" : "text-blue-500 hover:bg-gray-200"}`}>{index + 1}</button>
          ))}
        </div>
      </div>
    </div >
  );
};

export default IncompleteCoachTable;