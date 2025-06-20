'use client';

import React, { useEffect, useState } from "react";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import ActivityLog from "@/components/ecommerce/ActivityLog";
// import { useSession } from 'next-auth/react';

export default function Ecommerce() {
  // const { data: session } = useSession();
    const [role, setRole] = useState<string | null>(null);

 useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    setRole(storedRole);
  }, []);

  if (role === "Manager") {
    return (
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6">
          <EcommerceMetrics />
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-12">
        {/* <div>
          Welcome {session?.user?.id}
        </div> */}
        <EcommerceMetrics />
        <MonthlySalesChart />
        <ActivityLog/>
      </div>

      {/* <div className="col-span-12 xl:col-span-5">
      <EcommerceMetrics />
      </div> */}

      

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <RecentOrders />
      </div>
    </div>
  );
}
