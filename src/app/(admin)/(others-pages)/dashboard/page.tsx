'use client';
import React, { useEffect, useState } from "react";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import ActivityLog from "@/components/ecommerce/ActivityLog";
import { useRoleGuard } from "@/hooks/useRoleGaurd";

export default function Ecommerce() {
      useRoleGuard();
  
  const [role, setRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // flag to prevent server rendering issues

  useEffect(() => {
    setIsClient(true); // mark that we are on the client
    const storedRole = sessionStorage.getItem("role");
    setRole(storedRole);
  }, []);

  if (!isClient) {
    // Prevent rendering anything until client is ready
    return null;
  }

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
        <EcommerceMetrics />
        <MonthlySalesChart />
        <ActivityLog />
      </div>
    </div>
  );
}
