"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState, useEffect, useMemo, useCallback } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface VideoPayment {
  id: number;
  original_amount: string;
  amount: string;
  company_amount: string;
  status: string;
  created_at: string;
}

interface SaleItem {
  created_at: string;
  amount: string;
}


export default function DashboardCharts() {
  const currentYear = new Date().getFullYear();

  // ── Top-level year selector (affects ALL charts including Row 2) ──
  const [year, setYear] = useState<number>(currentYear);

  // ── Raw API data ──
  const [allSales, setAllSales]           = useState<SaleItem[]>([]);
  const [ticketData, setTicketData]       = useState<number[]>([0, 0, 0, 0]);
  const [coachStatus, setCoachStatus]     = useState<number[]>([0, 0, 0]);
  const [playerStatus, setPlayerStatus]   = useState<number[]>([0, 0, 0]);
  const [videoPayments, setVideoPayments] = useState<VideoPayment[]>([]);

  // ── UI state ──
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ── Fetch functions ──
  const fetchSalesData = useCallback(async () => {
    try {
      const res = await fetch("/api/sale");
      if (!res.ok) throw new Error("Failed to fetch sales data");
      const data = await res.json();
      const items: SaleItem[] = data.monthlySales ?? data.sales ?? [];
      setAllSales(items);
    } catch (err) {
      console.error(err);
      setError("Error fetching sales data");
    }
  }, []);

  const fetchTicketData = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets/status");
      if (!res.ok) throw new Error("Failed to fetch ticket data");
      const data = await res.json();
      const { open = 0, closed = 0, fixed = 0, pending = 0 } = data.statusCounts || {};
      setTicketData([open, closed, fixed, pending]);
    } catch (err) {
      console.error(err);
      setError("Error fetching ticket data");
    }
  }, []);

  const fetchCoachPlayerStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/stats/coach-player");
      if (!res.ok) throw new Error("Failed to fetch coach/player data");
      const data = await res.json();
      const coach  = data.coach  || {};
      const player = data.player || {};
      setCoachStatus([coach.view || 0, coach.suspended || 0, coach.disabled || 0]);
      setPlayerStatus([player.view || 0, player.suspended || 0, player.disabled || 0]);
    } catch (err) {
      console.error(err);
      setError("Error fetching coach/player status");
    }
  }, []);

  const fetchVideoPayments = useCallback(async () => {
    try {
      const res = await fetch("/api/video-payments");
      if (!res.ok) throw new Error("Failed to fetch video payments");
      const data = await res.json();
      const list: VideoPayment[] = Array.isArray(data)
        ? data
        : (data.payments ?? data.data ?? []);
      setVideoPayments(list);
    } catch (err) {
      console.error(err);
      setError("Error fetching video payments");
    }
  }, []);

  // ── Initial load ──
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchSalesData(),
      fetchTicketData(),
      fetchCoachPlayerStatus(),
      fetchVideoPayments(),
    ]).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // ── salesDataForVideoYear uses top-level year ──
  const salesDataForVideoYear = useMemo(() => {
    const monthly = Array(12).fill(0);
    allSales.forEach((item) => {
      if (!item.created_at) return;
      const d = new Date(item.created_at);
      if (d.getFullYear() === year) {
        monthly[d.getMonth()] += parseFloat(item.amount ?? "0");
      }
    });
    return monthly.map((v) => parseFloat(v.toFixed(2)));
  }, [allSales, year]);

  // ── monthlyVideoData filtered by top-level year ──
  const monthlyVideoData = useMemo(() => {
    const video = Array(12).fill(0);
    videoPayments.forEach((p) => {
      if (!p.created_at) return;
      const d = new Date(p.created_at);
      if (d.getFullYear() !== year) return;
      const m = d.getMonth();
      video[m] += parseFloat(p.original_amount ?? "0");
    });
    return {
      video: video.map((v) => parseFloat(v.toFixed(2))),
    };
  }, [videoPayments, year]);

  

  // ── Chart base options ──
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

  const combinedChartOptions: ApexOptions = {
    ...chartOptions,
    colors: ["#60a5fa", "#34d399", "#f59e0b", "#e879f9"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    tooltip: {
      x: { show: false },
      y: {
        formatter: (val: number) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
          }).format(val),
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(val),
      },
    },
  };

  return (
    <>
      {/* ── Year Selector (affects Row 1 Ticket/Coach/Player + Sales) ── */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">Year:</label>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded border px-3 py-1 text-sm"
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const y = currentYear - 2 + i;
            return <option key={y} value={y}>{y}</option>;
          })}
        </select>
      </div>

      {/* ── Row 1: Ticket / Coach / Player ── */}
      <div className="grid w-full gap-4 sm:grid-cols-1 xl:grid-cols-3 bg-white">
        {/* Ticket Status */}
        <div className="rounded-2xl border px-5 pt-5">
          <h3 className="text-lg font-semibold">Ticket Status</h3>
          <div className="pl-2">
            {loading ? (
              <div className="py-8 text-center text-sm text-gray-400">Loading...</div>
            ) : error ? (
              <div className="py-4 text-sm text-red-400">{error}</div>
            ) : (
              <ReactApexChart
                options={{
                  ...chartOptions,
                  colors: ["#60a5fa", "#f87171", "#34d399", "#facc15"],
                  plotOptions: {
                    ...chartOptions.plotOptions,
                    bar: { ...chartOptions.plotOptions?.bar, distributed: true },
                  },
                  xaxis: { ...chartOptions.xaxis, categories: ["Open", "Closed", "Fixed", "Pending"] },
                }}
                series={[{ name: "Tickets", data: ticketData }]}
                type="bar"
                height={180}
              />
            )}
          </div>
        </div>

        {/* Coach */}
        <div className="rounded-2xl border px-5 pt-5">
          <h3 className="text-lg font-semibold">Coach</h3>
          <div className="pl-2">
            {loading ? (
              <div className="py-8 text-center text-sm text-gray-400">Loading...</div>
            ) : error ? (
              <div className="py-4 text-sm text-red-400">{error}</div>
            ) : (
              <ReactApexChart
                options={{
                  ...chartOptions,
                  colors: ["#4ade80", "#facc15", "#f87171"],
                  plotOptions: {
                    ...chartOptions.plotOptions,
                    bar: { ...chartOptions.plotOptions?.bar, distributed: true },
                  },
                  xaxis: { ...chartOptions.xaxis, categories: ["Active", "Suspended", "Disabled"] },
                }}
                series={[{ name: "Coaches", data: coachStatus }]}
                type="bar"
                height={180}
              />
            )}
          </div>
        </div>

        {/* Player */}
        <div className="rounded-2xl border px-5 pt-5">
          <h3 className="text-lg font-semibold">Player</h3>
          <div className="pl-2">
            {loading ? (
              <div className="py-8 text-center text-sm text-gray-400">Loading...</div>
            ) : error ? (
              <div className="py-4 text-sm text-red-400">{error}</div>
            ) : (
              <ReactApexChart
                options={{
                  ...chartOptions,
                  colors: ["#60a5fa", "#f87171", "#34d399"],
                  plotOptions: {
                    ...chartOptions.plotOptions,
                    bar: { ...chartOptions.plotOptions?.bar, distributed: true },
                  },
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

      {/* ── Row 2: Combined Sales + Video Payment Analytics ── */}
      <div className="w-full mt-4">
        <div className="rounded-2xl border px-5 pt-5 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <h3 className="text-lg font-semibold">
              Monthly Sales &amp; Video Payment Analytics
            </h3>
          </div>

          {/* ── FIX 5: Tabs to toggle between Monthly and Yearly views ── */}
          <MonthlyYearlyCombinedChart
            loading={loading}
            error={error}
            monthlyVideoData={monthlyVideoData}
            salesDataForVideoYear={salesDataForVideoYear}
            combinedChartOptions={combinedChartOptions}
          />
        </div>
      </div>
    </>
  );
}

// ── Sub-component: Monthly chart only ──
interface CombinedChartProps {
  loading: boolean;
  error: string | null;
  monthlyVideoData: { video: number[] };
  salesDataForVideoYear: number[];
  combinedChartOptions: ApexOptions;
}

function MonthlyYearlyCombinedChart({
  loading,
  error,
  monthlyVideoData,
  salesDataForVideoYear,
  combinedChartOptions,
}: CombinedChartProps) {
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const series = [
    { name: "Sales", data: salesDataForVideoYear },
    { name: "Video", data: monthlyVideoData.video },
  ];

  if (loading) return <div className="py-8 text-center text-sm text-gray-400">Loading...</div>;
  if (error)   return <div className="py-4 text-sm text-red-400">{error}</div>;

  return (
    <ReactApexChart
      options={{
        ...combinedChartOptions,
        xaxis: {
          ...combinedChartOptions.xaxis,
          categories: MONTHS,
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
      }}
      series={series}
      type="bar"
      height={280}
    />
  );
}