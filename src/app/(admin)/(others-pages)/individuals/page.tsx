import type { Metadata } from "next";

import React from "react";
// // import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
// import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
// // import StatisticsChart from "@/components/ecommerce/StatisticsChart";
// import RecentOrders from "@/components/ecommerce/RecentOrders";
// import DemographicCard from "@/components/ecommerce/DemographicCard";
import Playerindividual from "@/components/individuals/Playerindividual";
import Map from "@/components/individuals/Map";


export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Playerdata() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7 w-[1000px]">
      < Playerindividual />
      <Map />
      </div>

      {/* <div className="col-span-12 xl:col-span-6">
      <Map />
      </div> */}

      

      {/* <div className="col-span-12">
        <StatisticsChart />
      </div> */}

      {/* <div className="col-span-12 xl:col-span-6">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <RecentOrders />
      </div> */}
    </div>
  );
}