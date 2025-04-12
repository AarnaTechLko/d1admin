"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreHorizontal } from "lucide-react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart() {
  const [salesData, setSalesData] = useState<number[]>([]);  // Sales data for chart
  const [loading, setLoading] = useState<boolean>(true);     // Loading state
  const [error, setError] = useState<string | null>(null);    // Error state
  const [isOpen, setIsOpen] = useState(false);

  // Fetch monthly sales data from API
  useEffect(() => {
    async function fetchSalesData() {
      try {
        const response = await fetch("/api/sale");  // API call to your monthly sales endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        const sales = new Array(12).fill(0);  // Initialize sales array for each month

        // Populate sales data for each month
        data.monthlySales.forEach((payment: { created_at: string; amount: string }) => {
          const date = new Date(payment.created_at);
          const month = date.getMonth();  // Get month index
          sales[month] += parseFloat(payment.amount);  // Aggregate the sales amount for the month
        });

        setSalesData(sales);
        setLoading(false);
      } catch (err) {
        setError("Error fetching data");
        console.log("Error",err)
        setLoading(false);
      }
    }

    fetchSalesData();
  }, []);

  // Chart options
  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  // Handle dropdown toggle
  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-sky-1 0 px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 w-[1000px]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Sales
        </h3>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreHorizontal className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          {loading ? (
            <div>Loading...</div> // Show a loading state
          ) : error ? (
            <div>{error}</div> // Show an error message if something goes wrong
          ) : (
            <ReactApexChart
              options={options}
              series={[{ name: "Sales", data: salesData }]} // Use fetched sales data
              type="bar"
              height={180}
            />
          )}
        </div>
      </div>
    </div>
  );
}
