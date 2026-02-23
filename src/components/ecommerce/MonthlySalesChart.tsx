"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardCharts() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);

  const [salesData, setSalesData] = useState<number[]>(Array(12).fill(0));
  const [ticketData, setTicketData] = useState<number[]>([0, 0, 0, 0]);
  const [coachStatus, setCoachStatus] = useState<number[]>([0, 0, 0]);
  const [playerStatus, setPlayerStatus] = useState<number[]>([0, 0, 0]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // ============================
  // FETCH SALES DATA
  // ============================
  const fetchSalesData = async () => {
    try {
      const response = await fetch("/api/sale");
      if (!response.ok) throw new Error("Failed to fetch sales data");

      const data = await response.json();
      const monthlySales = Array(12).fill(0);

      data.monthlySales?.forEach((item: { created_at: string; amount: string }) => {
        const date = new Date(item.created_at);
        if (date.getFullYear() === year) {
          monthlySales[date.getMonth()] += parseFloat(item.amount);
        }
      });

      setSalesData(monthlySales);
    } catch (err) {
      console.error(err);
      setError("Error fetching sales data");
    }
  };

  // ============================
  // FETCH TICKET STATUS
  // ============================
  const fetchTicketData = async () => {
    try {
      const response = await fetch("/api/tickets/status");
      if (!response.ok) throw new Error("Failed to fetch ticket data");

      const data = await response.json();
      const { open = 0, closed = 0, fixed = 0, pending = 0 } = data.statusCounts || {};

      setTicketData([open, closed, fixed, pending]);
    } catch (err) {
      console.error(err);
      setError("Error fetching ticket data");
    }
  };

  // ============================
  // FETCH COACH / PLAYER STATUS
  // ============================
  const fetchCoachPlayerStatus = async () => {
    try {
      const response = await fetch("/api/stats/coach-player");
      if (!response.ok) throw new Error("Failed to fetch coach/player data");

      const data = await response.json();
      const coach = data.coach || {};
      const player = data.player || {};

      setCoachStatus([coach.view || 0, coach.suspended || 0, coach.disabled || 0]);
      setPlayerStatus([player.view || 0, player.suspended || 0, player.disabled || 0]);
    } catch (err) {
      console.error(err);
      setError("Error fetching coach/player status");
    }
  };

  // ============================
  // EFFECT
  // ============================
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchSalesData(), fetchTicketData(), fetchCoachPlayerStatus()])
      .finally(() => setLoading(false));
  }, [year]);

  // ============================
  // CHART OPTIONS
  // ============================
  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 180,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    grid: { yaxis: { lines: { show: true } } },
    tooltip: { x: { show: false }, y: { formatter: (val: number) => `${val}` } },
    xaxis: { axisBorder: { show: false }, axisTicks: { show: false } },
    legend: { show: true, position: "top", horizontalAlign: "left" },
  };

  return (
    <>
      {/* YEAR SELECTOR */}
      <div className="mb-4">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded border px-3 py-1"
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const y = currentYear - 2 + i;
            return <option key={y} value={y}>{y}</option>;
          })}
        </select>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-1 xl:grid-cols-3 bg-white">
        {/* Ticket Status */}
        <div className="rounded-2xl border px-5 pt-5">
          <h3 className="text-lg font-semibold">Ticket Status</h3>
          <div className="pl-2">
            {loading ? <div>Loading...</div> : error ? <div>{error}</div> : (
              <ReactApexChart
                options={{
                  ...chartOptions,
                  colors: ["#60a5fa", "#f87171", "#34d399", "#facc15"],
                  plotOptions: { ...chartOptions.plotOptions, bar: { ...chartOptions.plotOptions?.bar, distributed: true } },
                  xaxis: { ...chartOptions.xaxis, categories: ["Open", "Closed", "Fixed", "Pending"] },
                }}
                series={[{ name: "Tickets", data: ticketData }]}
                type="bar"
                height={180}
              />
            )}
          </div>
        </div>

        {/* Coach Status */}
        <div className="rounded-2xl border px-5 pt-5">
          <h3 className="text-lg font-semibold">Coach</h3>
          <div className="pl-2">
            {loading ? <div>Loading...</div> : error ? <div>{error}</div> : (
              <ReactApexChart
                options={{
                  ...chartOptions,
                  colors: ["#4ade80", "#facc15", "#f87171"],
                  plotOptions: { ...chartOptions.plotOptions, bar: { ...chartOptions.plotOptions?.bar, distributed: true } },
                  xaxis: { ...chartOptions.xaxis, categories: ["Active", "Suspended", "Disabled"] },
                }}
                series={[{ name: "Coaches", data: coachStatus }]}
                type="bar"
                height={180}
              />
            )}
          </div>
        </div>

        {/* Player Status */}
        <div className="rounded-2xl border px-5 pt-5">
          <h3 className="text-lg font-semibold">Player</h3>
          <div className="pl-2">
            {loading ? <div>Loading...</div> : error ? <div>{error}</div> : (
              <ReactApexChart
                options={{
                  ...chartOptions,
                  colors: ["#60a5fa", "#f87171", "#34d399"],
                  plotOptions: { ...chartOptions.plotOptions, bar: { ...chartOptions.plotOptions?.bar, distributed: true } },
                  xaxis: { ...chartOptions.xaxis, categories: ["Active", "Suspended", "Disabled"] },
                }}
                series={[{ name: "Players", data: playerStatus }]}
                type="bar"
                height={180}
              />
            )}
          </div>
        </div>
      </div>

      {/* Monthly Sales */}
      <div className="rounded-2xl border px-5 pt-5 mt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Monthly Sales ({year})</h3>
          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
            <DropdownItem onItemClick={() => setIsOpen(false)}>View More</DropdownItem>
            <DropdownItem onItemClick={() => setIsOpen(false)}>Delete</DropdownItem>
          </Dropdown>
        </div>
        <div className="pl-2">
          {loading ? <div>Loading...</div> : error ? <div>{error}</div> : (
            <ReactApexChart
              options={{
                ...chartOptions,
                colors: [
                  "#60a5fa", "#34d399", "#f87171", "#facc15",
                  "#a78bfa", "#fb7185", "#2dd4bf", "#38bdf8",
                  "#e879f9", "#fbbf24", "#cbd5e1", "#f59e0b"
                ],
                xaxis: { ...chartOptions.xaxis, categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
                // 👇 ADD THIS
                yaxis: {
                  labels: {
                    formatter: function (val: number) {
                      return Number(val).toFixed(2); // removes decimals
                    }
                  }
                }

        
              }}
          series={[{ name: "Sales", data: salesData }]}
          type="bar"
          height={180}
            />
          )}
        </div>
      </div>
    </>
  );
}
