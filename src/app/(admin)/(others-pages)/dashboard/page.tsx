'use client';
import React from "react";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import MonthlySignupChart from "@/components/ecommerce/MonthlySignupChart";
import ActivityLog from "@/components/ecommerce/ActivityLog";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { useRoleGuard } from "@/hooks/useRoleGaurd";
import { useSession } from 'next-auth/react';

export default function Ecommerce() {
  useRoleGuard(); // ensures only authorized roles can access

  const { data: session, status } = useSession();

  // Wait for session to load before rendering
  if (status === "loading") return null;

  const role = session?.user?.role;

  // Special case for Manager
  if (role === "Manager") {
    return (
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6">
          <EcommerceMetrics />
        </div>
      </div>
    );
  }

  // Default dashboard for other roles
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-12">
        <EcommerceMetrics />
        <MonthlySignupChart />
        <MonthlySalesChart />
        <ActivityLog />
        <DemographicCard />
      </div>
    </div>
  );
}
