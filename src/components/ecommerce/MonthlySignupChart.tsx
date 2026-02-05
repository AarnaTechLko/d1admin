// "use client";

// import { ApexOptions } from "apexcharts";
// import dynamic from "next/dynamic";
// import { useState, useEffect } from "react";
// // import { DropdownItem } from "../ui/dropdown/DropdownItem";
// // import { Dropdown } from "../ui/dropdown/Dropdown";

// // const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// export default function DashboardComboChart() {

//     const [userData, setUserData] = useState<number[]>(Array(12).fill(0));
//     const [coachData, setCoachData] = useState<number[]>(Array(12).fill(0));

//     // const [filter, setFilter] = useState<"month" | "week" | "day">("month");

//     // const [ticketData, setTicketData] = useState<number[]>([0, 0, 0, 0]);
//     // const [loading, setLoading] = useState(true);
//     // const [error, setError] = useState<string | null>(null);
//     // const [isOpen, setIsOpen] = useState(false);
//     // const [coachStatus, setCoachStatus] = useState<number[]>([0, 0, 0]);
//     // const [playerStatus, setPlayerStatus] = useState<number[]>([0, 0, 0]);



//     const ReactApexChart = dynamic(() => import('react-apexcharts'), {
//     ssr: false,
//     });


//     const options: ApexOptions = {
//           chart: {
//           height: 350,
//           type: "line" as const,
//           zoom: {
//             enabled: false
//           },
//           // toolbar: {
//           //   autoSelected: "zoom",
//           // }
//         },
//         dataLabels: {
//           enabled: false
//         },
//         stroke: {
//           curve: 'straight' 
//         },
//         title: {
//           text: '# of signups by Month',
//           align: 'left'
//         },
//         grid: {
//           row: {
//             colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
//             opacity: 0.5
//           },
//         },
//         xaxis: {
//           categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//         },
//         // tooltip: {
//         //   x: { format: filter === "day" ? "dd MMM" : filter === "week" ? "wo [week]" : "MMM yyyy" }
//         // }
//     }


//     useEffect( () => {

//         const fetchUserCount = async() => {

//             const coachResponse = await fetch("api/coachSignUp");

//             const playerResponse = await fetch("api/playerSignUp");

//             if (!coachResponse.ok || !playerResponse.ok){
//                 throw new Error("Failed to fetch coach or player signup dates");
//             }
//             const coachData = await coachResponse.json();
//             const playerData = await playerResponse.json();

//             console.log("C DATA: ", coachData);

//             const monthlyCoaches = new Array(12).fill(0);
//             const monthlyPlayers = new Array(12).fill(0);

//             coachData?.monthlyCoaches?.forEach((item: {created_at: string}) => {

//               const month = new Date(item.created_at).getMonth();
//               monthlyCoaches[month] += 1;
//             })

//             playerData?.monthlyPlayers?.forEach((item: {created_at: string}) => {

//               const month = new Date(item.created_at).getMonth();
//               monthlyPlayers[month] += 1;
//             })

//             setCoachData(monthlyCoaches);
//             setUserData(monthlyPlayers);
//         }

//         fetchUserCount();

//     }, [])

//   const series = [
//     {
//       name: "Coaches",
//       data: coachData
//     },
//     {
//       name: "Players",
//       data: userData
//     }
//   ]

 
//     return (

//       <div>

//         {/* <select>
//           <option>Year</option>
//           <option>Month</option>
//           <option>Day</option>
//         </select> */}

//         <ReactApexChart 
//           options={options}
//           series={series}
//           height={350}
//         />
      
//       </div>
//     )

// }

"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function DashboardComboChart() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState<number>(currentYear);
  const [coachData, setCoachData] = useState<number[]>(Array(12).fill(0));
  const [playerData, setPlayerData] = useState<number[]>(Array(12).fill(0));

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const coachResponse = await fetch("/api/coachSignUp");
        const playerResponse = await fetch("/api/playerSignUp");

        if (!coachResponse.ok || !playerResponse.ok) {
          throw new Error("Failed to fetch signup data");
        }

        const coachResult = await coachResponse.json();
        const playerResult = await playerResponse.json();

        const monthlyCoaches = Array(12).fill(0);
        const monthlyPlayers = Array(12).fill(0);

        coachResult?.monthlyCoaches?.forEach(
          (item: { created_at: string }) => {
            const date = new Date(item.created_at);
            if (date.getFullYear() === year) {
              monthlyCoaches[date.getMonth()] += 1;
            }
          }
        );

        playerResult?.monthlyPlayers?.forEach(
          (item: { created_at: string }) => {
            const date = new Date(item.created_at);
            if (date.getFullYear() === year) {
              monthlyPlayers[date.getMonth()] += 1;
            }
          }
        );

        setCoachData(monthlyCoaches);
        setPlayerData(monthlyPlayers);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserCount();
  }, [year]);

  const options: ApexOptions = {
    chart: {
      height: 350,
      type: "line",
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "straight" },
    title: {
      text: `# of Signups by Month (${year})`,
      align: "left",
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5,
      },
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
    },
  };

  const series = [
    {
      name: "Coaches",
      data: coachData,
    },
    {
      name: "Players",
      data: playerData,
    },
  ];

  return (
    <div>
      {/* Year Filter */}
      <div style={{ marginBottom: "12px" }}>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border rounded px-3 py-1"
        >
          {Array.from({ length: 5 }).map((_, index) => {
            const y = currentYear - 2 + index;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>
      </div>

      <ReactApexChart options={options} series={series} height={350} />
    </div>
  );
}
