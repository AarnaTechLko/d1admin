"use client";

import React, { useState, useEffect } from "react";
import { Coach, Player, Organization, Ticket, Team } from "@/app/types/types";
import PlayerTable from "@/components/tables/PlayerTable";
import CoachTable from "@/components/tables/CoachTable";
import OrganizationTable from "@/components/tables/OrganizationTable";
import TicketTable from "@/components/tables/TicketTable";
import EvaluationTable, { Evaluation } from "../tables/EvaluationTable";
import PaymentTable from "../tables/PaymentTable";
import { Payment } from "../types/types";
import { Loader2 } from "lucide-react";
  import Swal from "sweetalert2";

const tabs = [
  "Player",
  "Coach",
  "Organization",
  "Team",
  "Ticket",
  "Payment",
  "Evaluation",
] as const;

type TimeRange = "24h" | "1w" | "1m" | "1y";

type TabType = (typeof tabs)[number];
type GenericData = Player | Coach | Organization | Ticket | Team;

export default function TabbedDataView() {
  const [activeTab, setActiveTab] = useState<TabType>("Player");
  const [data, setData] = useState<GenericData[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // const [userId, setUserId] = useState<string>("");
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  // useEffect(() => {
  //   const storedUserId = localStorage.getItem("userId");
  //   if (storedUserId) setUserId(storedUserId);
  // }, []);

  const fetchData = async (tab: TabType, page: number, range: TimeRange) => {
    setLoading(true);
    try {
      const endpointMap: Record<TabType, string> = {
        Player: "player",
        Coach: "coach",
        Organization: "organization",
        Team: "teams",
        Ticket: "tickets",
        Payment: "payments",
        Evaluation: "evaluations",
      };
      const endpoint = endpointMap[tab];
      const res = await fetch(`/api/${endpoint}?page=${page}&limit=10&timeRange=${range}`);
      const json = await res.json();
      if (tab === "Payment") {
        setPayments(json.data || []);
      } else if (tab === "Evaluation") {
        setEvaluations(json.data || []);
      } else {
        const payload =
          json.data ||
          json.coaches ||
          json.enterprises ||
          json.payments ||
          json.teams ||
          json.evaluations ||
          json[tab.toLowerCase()] ||
          [];

        setData(payload);
      }

      setTotalPages(json.totalPages || 1);
    } catch (err) {
      console.error(`Failed to fetch ${tab} data:`, err);
      if (tab === "Payment") setPayments([]);
      else if (tab === "Evaluation") setEvaluations([]);
      else setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab, currentPage, timeRange);
  }, [activeTab, currentPage, timeRange]);

  const handleAssignClick = (ticket: Ticket) => {
    console.log("Assign clicked:", ticket);
  };

  const handleReplyClick = (ticket: Ticket) => {
    console.log("Reply clicked:", ticket);
  };


const handleHidePayment = async (evaluationId: number) => {
  try {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "This payment will be hidden.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, hide it!",
    });

    if (confirmResult.isConfirmed) {
      const res = await fetch(`/api/payments/hide/${evaluationId}`, {
        method: "PATCH",
      });

      if (res.ok) {
        Swal.fire("Hidden!", "The payment has been hidden.", "success");
        fetchData("Payment", currentPage, timeRange);
      } else {
        Swal.fire("Error!", "Failed to hide the payment.", "error");
      }
    }
  } catch (err) {
    console.error("Hide payment failed:", err);
    Swal.fire("Error!", "An error occurred while hiding payment.", "error");
  }
};

const handleRevertPayment = async (evaluationId: number) => {
  try {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "This payment will be reverted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, revert it!",
    });

    if (confirmResult.isConfirmed) {
      const res = await fetch(`/api/payments/revert/${evaluationId}`, {
        method: "PATCH",
      });

      if (res.ok) {
        Swal.fire("Reverted!", "The payment has been reverted.", "success");
        fetchData("Payment", currentPage, timeRange);
      } else {
        Swal.fire("Error!", "Failed to revert the payment.", "error");
      }
    }
  } catch (err) {
    console.error("Revert payment failed:", err);
    Swal.fire("Error!", "An error occurred while reverting payment.", "error");
  }
};


  return (
    <div className="p-6 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800">Activity Log</h1>
          <p className="text-sm text-gray-500">(in selected period)</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => {
            setTimeRange(e.target.value as TimeRange);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="1w">Last 1 Week</option>
          <option value="1m">Last 1 Month</option>
          <option value="1y">Last 1 Year</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`flex-1 min-w-[120px] text-center px-6 py-3 rounded-md font-medium text-sm transition-all duration-200 ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="w-full border p-4 rounded bg-white shadow">
        <h2 className="text-lg font-semibold mb-4">
          {activeTab} added in selected time range
        </h2>


        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 p-4">
            <Loader2 className="animate-spin" size={20} />
            Loading {activeTab.toLowerCase()}...
          </div>) : activeTab === "Ticket" ? (
            <TicketTable
              data={data as Ticket[]}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              onAssignClick={handleAssignClick}
              onReplyClick={handleReplyClick}
            />
          ) : activeTab === "Player" ? (
            <PlayerTable
              data={data as Player[]}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          ) : activeTab === "Coach" ? (
            <CoachTable
              data={data as Coach[]}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          ) : activeTab === "Organization" ? (
            <OrganizationTable
              data={data as Organization[]}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          ) : activeTab === "Team" ? (
            <div className="overflow-x-auto">
                 {data.length === 0 ? (
        <p className="p-6 text-gray-600">No Team found.</p>
      ) : (
              <table className="min-w-full border border-gray-200 text-sm">
                
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Logo</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Organization</th>
                    <th className="p-2 border">Players</th>
                    <th className="p-2 border">Coaches</th>
                    <th className="p-2 border">Type</th>
                    <th className="p-2 border">Year</th>
                    <th className="p-2 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data as Team[]).map((team) => (
                    <tr key={team.id}>
                      <td className="p-2 border text-center">
                        <img
                          src={team.logo}
                          alt={team.team_name}
                          className="w-10 h-10 rounded-full mx-auto"
                        />
                      </td>
                      <td className="p-2 border text-center">{team.team_name}</td>
                      <td className="p-2 border text-center">{team.organisation_name || "N/A"}</td>
                      <td className="p-2 border text-center">{team.totalPlayers}</td>
                      <td className="p-2 border text-center">{team.totalCoaches}</td>
                      <td className="p-2 border text-center">{team.team_type}</td>
                      <td className="p-2 border text-center">{team.team_year}</td>
                      <td className="p-2 border text-center">{team.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
      )}
            </div>
          ) : activeTab === "Evaluation" ? (
            <EvaluationTable
              data={evaluations}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          ) : activeTab === "Payment" ? (
            <PaymentTable
              data={payments}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              onHide={handleHidePayment}
              onRevert={handleRevertPayment}
            />
          ) : (
          <p>No recent {activeTab} data found.</p>
        )}
      </div>
    </div>
  );
}
