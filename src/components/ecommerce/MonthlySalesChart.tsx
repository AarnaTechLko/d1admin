"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardCharts() {
  const [salesData, setSalesData] = useState<number[]>(Array(12).fill(0));
  const [ticketData, setTicketData] = useState<number[]>([0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
const [coachStatus, setCoachStatus] = useState<number[]>([0, 0, 0]);
const [playerStatus, setPlayerStatus] = useState<number[]>([0, 0, 0]);



  const fetchSalesData = async () => {
    try {
      const response = await fetch("/api/sale");
      if (!response.ok) throw new Error("Failed to fetch sales data");
      const data = await response.json();

      const monthlySales = new Array(12).fill(0);
      data.monthlySales.forEach((item: { created_at: string; amount: string }) => {
        const month = new Date(item.created_at).getMonth();
        monthlySales[month] += parseFloat(item.amount);
      });
      setSalesData(monthlySales);
    } catch (err) {
      console.error(err);
      setError("Error fetching sales data");
    }
  };

  const fetchTicketData = async () => {
    try {
      const response = await fetch("/api/tickets/status");
      if (!response.ok) throw new Error("Failed to fetch ticket data");
      const data = await response.json();
console.log("dataaaaaa",data);
      const open = data.statusCounts.open || 0;
      const closed = data.statusCounts.closed || 0;
      const fixed = data.statusCounts.fixed || 0;
      const pending = data.statusCounts.pending || 0;

      setTicketData([open, closed, fixed, pending]);
    } catch (err) {
      console.error(err);
      setError("Error fetching ticket data");
    }
  };
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
  useEffect(() => {
  Promise.all([fetchSalesData(), fetchTicketData(), fetchCoachPlayerStatus()])
    .finally(() => setLoading(false));
}, []);


  // useEffect(() => {
  //   Promise.all([fetchSalesData(), fetchTicketData()]).finally(() => setLoading(false));
  // }, []);

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar" as const,
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
    fill: { opacity: 1 },
    grid: {
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      x: { show: false },
      y: { formatter: (val: number) => `${val}` },
    },
    xaxis: { axisBorder: { show: false }, axisTicks: { show: false } },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    colors: ["#465fff"],
  };

  return (
    <>
<div className="grid w-full gap-4 sm:grid-cols-1 bg-white md:grid-cols-1 xl:grid-cols-3">
      {/* Monthly Sales */}


      {/* Ticket Status */}
      <div className=" rounded-2xl border border-gray-200  px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Ticket Status</h3>
        </div>
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>{error}</div>
          ) : (
           <ReactApexChart
  options={{
    ...chartOptions,
    colors: [
      "#60a5fa", // Open - blue-400
      "#f87171", // Closed - red-400
      "#34d399", // Fixed - green-400
      "#facc15", // Pending - yellow-400
    ],
    plotOptions: {
      ...chartOptions.plotOptions,
      bar: {
        ...chartOptions.plotOptions?.bar,
        distributed: true, // each bar gets a different color
      },
    },
    xaxis: {
      ...chartOptions.xaxis,
      categories: ["Open", "Closed", "Fixed", "Pending"],
    },
  }}
  series={[{ name: "Tickets", data: ticketData }]}
  type="bar"
  height={180}
/>

          )}
        </div>
      </div>
      {/* Coach Status */}
<div className=" rounded-2xl border border-gray-200  px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Coach </h3>
  <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
    {loading ? (
      <div>Loading...</div>
    ) : error ? (
      <div>{error}</div>
    ) : (
     <ReactApexChart
  options={{
    ...chartOptions,
    colors: ["#4ade80", "#facc15", "#f87171"], // Green, Yellow, Red
    plotOptions: {
      ...chartOptions.plotOptions,
      bar: {
        ...chartOptions.plotOptions?.bar,
        distributed: true, // 🔑 Distribute different colors per bar
      },
    },
    xaxis: {
      ...chartOptions.xaxis,
      categories: ["Active", "Suspended", "Disabled"],
    },
  }}
  series={[{ name: "Coaches", data: coachStatus }]}
  type="bar"
  height={180}
/>

    )}
  </div>
</div>

{/* Player Status */}
<div className=" rounded-2xl border border-gray-200  px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Player </h3>
  <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
    {loading ? (
      <div>Loading...</div>
    ) : error ? (
      <div>{error}</div>
    ) : (
     <ReactApexChart
  options={{
    ...chartOptions,
colors: ["#60a5fa", // Open - blue-400
      "#f87171", // Closed - red-400
      "#34d399",], 
    plotOptions: {
      ...chartOptions.plotOptions,
      bar: {
        ...chartOptions.plotOptions?.bar,
        distributed: true, // enables one color per category
      },
    },
    xaxis: {
      ...chartOptions.xaxis,
      categories: ["Active", "Suspended", "Disabled"],
    },
  }}
  series={[{ name: "Player", data: playerStatus }]} // or "Players"
  type="bar"
  height={180}
/>

    )}
  </div>
</div>

    </div>

<div className="grid w-full gap-4 sm:grid-cols-1 bg-white md:grid-cols-1 xl:grid-cols-1">

      <div className="rounded-2xl border border-gray-200  px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Monthly Sales</h3>
          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
            <DropdownItem onItemClick={() => setIsOpen(false)}>View More</DropdownItem>
            <DropdownItem onItemClick={() => setIsOpen(false)}>Delete</DropdownItem>
          </Dropdown>
        </div>
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>{error}</div>
          ) : (
           <ReactApexChart
  options={{
    ...chartOptions,
    colors: [
      "#60a5fa", // Jan - blue-400
      "#34d399", // Feb - green-400
      "#f87171", // Mar - red-400
      "#facc15", // Apr - yellow-400
      "#a78bfa", // May - purple-400
      "#fb7185", // Jun - rose-400
      "#2dd4bf", // Jul - teal-400
      "#38bdf8", // Aug - sky-400
      "#e879f9", // Sep - fuchsia-400
      "#fbbf24", // Oct - amber-400
      "#cbd5e1", // Nov - slate-300
      "#f59e0b", // Dec - orange-400
    ],
    plotOptions: {
      ...chartOptions.plotOptions,
      bar: {
        ...chartOptions.plotOptions?.bar,
        distributed: true, // enables each bar to use its corresponding color
      },
    },
    xaxis: {
      ...chartOptions.xaxis,
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ],
    },
  }}
  series={[{ name: "Sales", data: salesData }]}
  type="bar"
  height={180}
/>

          )}
        </div>
      </div>
      </div>
      </>
  );
}